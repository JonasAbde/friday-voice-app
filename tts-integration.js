/**
 * ELEVENLABS TTS INTEGRATION (Direct API)
 * 
 * High-quality Danish female voice using ElevenLabs API
 * Voice: pFZP5JQG7iQjIQuC4Bku (Dansk stemme - kvindelig)
 * 
 * @author Friday (AI Agent)
 * @created 2026-02-06
 * @revised 2026-02-06 (direct API integration)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

class TTSEngine {
    constructor() {
        // Load config from environment
        this.apiKey = process.env.ELEVENLABS_API_KEY || 'sk_f02e6ea3be08ba80f4a4e5d9758e67cfb8e1a2af3c6c789a';
        this.voiceId = process.env.ELEVENLABS_VOICE_ID || 'pFZP5JQG7iQjIQuC4Bku'; // Dansk kvindelig stemme
        this.model = process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2';
        
        // Cache directory for audio files
        this.cacheDir = path.join(__dirname, 'audio-cache');
        this.ensureCacheDir();
        
        console.log('🔊 ElevenLabs TTS initialized (Dansk kvindelig stemme)');
    }
    
    ensureCacheDir() {
        if (!fs.existsSync(this.cacheDir)) {
            fs.mkdirSync(this.cacheDir, { recursive: true });
            console.log('📁 Created audio cache directory');
        }
    }
    
    /**
     * Generate audio from text using ElevenLabs API
     * Includes retry logic with exponential backoff
     * @param {string} text - Text to convert to speech
     * @param {number} attempt - Current attempt number (for retry logic)
     * @returns {Promise<string>} Path to audio file
     */
    async generateAudio(text, attempt = 1) {
        const maxAttempts = 3;
        const timeout = 10000; // 10 second timeout per request
        
        return new Promise((resolve, reject) => {
            const timestamp = Date.now();
            const filename = `friday-${timestamp}.mp3`;
            const outputPath = path.join(this.cacheDir, filename);
            
            // ElevenLabs API endpoint
            const url = `https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`;
            
            // Request payload
            const payload = JSON.stringify({
                text: text,
                model_id: this.model,
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                    style: 0.0,
                    use_speaker_boost: true
                }
            });
            
            const options = {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': this.apiKey
                },
                timeout: timeout
            };
            
            console.log(`🔊 Generating ElevenLabs TTS audio (attempt ${attempt}/${maxAttempts})...`);
            
            // Set request timeout
            const timeoutHandle = setTimeout(() => {
                req.destroy();
                console.error(`⏱️  ElevenLabs request timeout (${timeout}ms)`);
            }, timeout);
            
            const req = https.request(url, options, (res) => {
                clearTimeout(timeoutHandle);
                
                if (res.statusCode !== 200) {
                    const errorMsg = `API returned ${res.statusCode}`;
                    console.error('❌ ElevenLabs API error:', errorMsg);
                    
                    // Log response body for debugging
                    let body = '';
                    res.on('data', chunk => body += chunk);
                    res.on('end', () => {
                        console.error('Error response:', body);
                        this.handleRetry(text, attempt, maxAttempts, errorMsg, resolve, reject);
                    });
                    return;
                }
                
                const fileStream = fs.createWriteStream(outputPath);
                res.pipe(fileStream);
                
                fileStream.on('finish', () => {
                    fileStream.close();
                    console.log(`✅ ElevenLabs audio generated: ${filename} (attempt ${attempt})`);
                    
                    // Log success for monitoring
                    this.logTTSMetrics('success', attempt);
                    
                    resolve(`/audio/${filename}`);
                });
                
                fileStream.on('error', (err) => {
                    fs.unlink(outputPath, () => {});
                    console.error('❌ File write error:', err.message);
                    this.handleRetry(text, attempt, maxAttempts, err.message, resolve, reject);
                });
            });
            
            req.on('error', (err) => {
                clearTimeout(timeoutHandle);
                console.error('❌ ElevenLabs request failed:', err.message);
                this.handleRetry(text, attempt, maxAttempts, err.message, resolve, reject);
            });
            
            req.on('timeout', () => {
                clearTimeout(timeoutHandle);
                req.destroy();
                console.error('⏱️  Request timeout');
                this.handleRetry(text, attempt, maxAttempts, 'timeout', resolve, reject);
            });
            
            req.write(payload);
            req.end();
        });
    }
    
    /**
     * Handle retry logic with exponential backoff
     */
    async handleRetry(text, attempt, maxAttempts, errorMsg, resolve, reject) {
        if (attempt < maxAttempts) {
            // Exponential backoff: 1s, 2s, 4s
            const backoffMs = Math.pow(2, attempt - 1) * 1000;
            console.log(`🔄 Retrying in ${backoffMs}ms...`);
            
            setTimeout(async () => {
                try {
                    const result = await this.generateAudio(text, attempt + 1);
                    resolve(result);
                } catch (err) {
                    reject(err);
                }
            }, backoffMs);
        } else {
            console.error(`❌ ElevenLabs failed after ${maxAttempts} attempts`);
            this.logTTSMetrics('failure', attempt);
            reject(new Error(`Failed after ${maxAttempts} attempts: ${errorMsg}`));
        }
    }
    
    /**
     * Log TTS metrics for monitoring
     */
    logTTSMetrics(status, attempts) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            status: status,
            attempts: attempts,
            source: 'ElevenLabs'
        };
        
        const logFile = path.join(this.cacheDir, 'tts-metrics.jsonl');
        fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
        
        if (status === 'failure') {
            console.error('⚠️  TTS FAILURE LOGGED - Check fallback behavior!');
        }
    }
    
    /**
     * Clean old cache files (keep last 100)
     */
    cleanCache() {
        try {
            const files = fs.readdirSync(this.cacheDir)
                .filter(f => f.startsWith('friday-') && f.endsWith('.mp3'))
                .map(f => ({
                    name: f,
                    path: path.join(this.cacheDir, f),
                    mtime: fs.statSync(path.join(this.cacheDir, f)).mtime
                }))
                .sort((a, b) => b.mtime - a.mtime);
            
            // Delete old files (keep last 100)
            if (files.length > 100) {
                files.slice(100).forEach(file => {
                    fs.unlinkSync(file.path);
                    console.log('🗑️  Deleted old cache:', file.name);
                });
            }
        } catch (err) {
            console.error('⚠️  Cache cleanup failed:', err.message);
        }
    }
}

module.exports = TTSEngine;
