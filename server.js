/**
 * FRIDAY VOICE SERVER
 * 
 * Self-built WebSocket server for real-time voice communication with Friday AI.
 * Handles client connections, message routing, and AI integration.
 * 
 * Architecture:
 * - Express serves static HTML/JS files
 * - WebSocket handles real-time bidirectional communication
 * - OpenClaw CLI integration for AI responses
 * - ElevenLabs API for high-quality Danish TTS
 * 
 * @author Friday (AI Agent)
 * @version 0.2.0-alpha
 * @created 2026-02-06
 */

// Load environment variables
require('dotenv').config();

const WebSocket = require('ws');
const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const TTSEngine = require('./tts-integration');

/**
 * Main server class handling HTTP and WebSocket connections
 */
class FridayVoiceServer {
    /**
     * Initialize server with default configuration
     */
    constructor() {
        // Server configuration
        this.port = 8765;  // Local port (exposed via Cloudflare Tunnel)
        this.app = express();  // HTTP server for static files
        this.wss = null;  // WebSocket server instance
        this.clients = new Set();  // Track active WebSocket connections
        this.tts = new TTSEngine();  // TTS engine for voice output
        
        this.init();
    }
    
    /**
     * Initialize all server components
     * Order: Express → WebSocket → Start
     */
    init() {
        this.setupExpress();
        this.setupWebSocket();
        this.start();
    }
    
    /**
     * Configure Express HTTP server
     * - Serves static files (HTML, CSS, JS)
     * - Serves TTS audio files from cache
     * - Provides health check endpoint for monitoring
     */
    setupExpress() {
        // Enable CORS headers for SharedArrayBuffer (required by Porcupine)
        // This enables multi-threaded WASM processing for better performance
        this.app.use((req, res, next) => {
            res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
            res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
            next();
        });
        
        // Serve static files from current directory
        // This includes index.html, voice-client.js, etc.
        this.app.use(express.static(path.join(__dirname)));
        
        // Serve TTS audio files from cache directory
        this.app.use('/audio', express.static(path.join(__dirname, 'audio-cache')));
        
        // Health check endpoint for monitoring/debugging
        // Returns server status, client count, uptime
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'online',
                server: 'Friday Voice Server',
                clients: this.clients.size,  // Number of active WebSocket connections
                uptime: process.uptime(),  // Server uptime in seconds
                tts: 'ElevenLabs (OpenClaw)'
            });
        });
        
        // Start HTTP server on localhost only (accessed via Cloudflare Tunnel)
        // Binding to 127.0.0.1 prevents direct external access
        this.server = this.app.listen(this.port, '127.0.0.1', () => {
            console.log(`🖐️  Friday Voice Server running on http://127.0.0.1:${this.port}`);
        });
    }
    
    setupWebSocket() {
        this.wss = new WebSocket.Server({ server: this.server, path: '/ws' });
        
        this.wss.on('connection', (ws, req) => {
            console.log('✅ New client connected:', req.socket.remoteAddress);
            this.clients.add(ws);
            
            ws.on('message', async (data) => {
                try {
                    const message = JSON.parse(data);
                    await this.handleClientMessage(ws, message);
                } catch (error) {
                    console.error('Error handling message:', error);
                    this.sendError(ws, 'Failed to process message');
                }
            });
            
            ws.on('close', () => {
                console.log('❌ Client disconnected');
                this.clients.delete(ws);
            });
            
            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                this.clients.delete(ws);
            });
            
            // Send welcome message
            this.send(ws, {
                type: 'status',
                message: 'Connected to Friday Voice Server 🟢'
            });
        });
    }
    
    async handleClientMessage(ws, message) {
        console.log('📨 Received:', message.type);
        
        switch (message.type) {
            case 'ping':
                // Respond to ping for connection quality monitoring
                this.send(ws, { type: 'pong' });
                break;
                
            case 'voice_message':
                await this.processVoiceMessage(ws, message.transcript);
                break;
                
            default:
                console.warn('Unknown message type:', message.type);
        }
    }
    
    async processVoiceMessage(ws, transcript) {
        console.log('🎙️  User said:', transcript);
        
        try {
            // Call Friday AI (via OpenClaw session)
            const fridayResponse = await this.askFriday(transcript);
            
            // Generate TTS audio
            const audioUrl = await this.generateTTS(fridayResponse);
            
            // Send response back to client
            this.send(ws, {
                type: 'friday_response',
                text: fridayResponse,
                audioUrl: audioUrl
            });
            
        } catch (error) {
            console.error('Error processing voice message:', error);
            this.sendError(ws, 'Failed to get response from Friday');
        }
    }
    
    /**
     * Send message to Friday AI via OpenClaw agent command
     * Uses dedicated 'voice-interface' session to avoid conflicts with main session
     * @param {string} message - User's message text
     * @returns {Promise<string>} Friday's response
     */
    async askFriday(message) {
        return new Promise((resolve, reject) => {
            // Escape double quotes in message
            const escapedMessage = message.replace(/"/g, '\\"');
            
            // Use dedicated VOICE session with optimized context
            // Faster than MAIN (doesn't load everything), but still has key tools
            const command = `openclaw agent --session-id friday-voice --message "${escapedMessage}"`;
            
            console.log('🤖 Calling Friday AI (Voice session - optimized)...');
            
            exec(command, { maxBuffer: 1024 * 1024, timeout: 60000 }, (error, stdout, stderr) => {
                if (error) {
                    console.error('❌ Error calling Friday:', error.message);
                    reject(error);
                    return;
                }
                
                // Extract Friday's response from output
                // Filter out system messages (lines starting with [ or empty)
                const lines = stdout.split('\n');
                const response = lines
                    .filter(l => l.trim() && !l.startsWith('[') && !l.includes('session_status'))
                    .join('\n')
                    .trim();
                
                console.log('✅ Friday responded:', response.substring(0, 50) + '...');
                
                resolve(response || 'Jeg hørte dig, men har intet at sige lige nu.');
            });
        });
    }
    
    /**
     * Generate TTS audio for Friday's response
     * Uses TTS engine with ElevenLabs/OpenClaw integration
     * @param {string} text - Friday's text response
     * @returns {Promise<string|null>} URL to audio file or null if failed
     */
    async generateTTS(text) {
        try {
            const audioUrl = await this.tts.generateAudio(text);
            return audioUrl;
        } catch (error) {
            console.error('⚠️  TTS failed (fallback to text-only):', error.message);
            return null; // Graceful degradation - still show text
        }
    }
    
    send(ws, data) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(data));
        }
    }
    
    sendError(ws, message) {
        this.send(ws, {
            type: 'error',
            message: message
        });
    }
    
    start() {
        console.log('\n🚀 Friday Voice Server started!');
        console.log('📍 Local: http://127.0.0.1:' + this.port);
        console.log('🌐 Public: Expose via Cloudflare Tunnel');
        console.log('\n🖐️  Friday is ready to talk!\n');
    }
}

// Start the server
new FridayVoiceServer();
