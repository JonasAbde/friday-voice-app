/**
 * ELEVENLABS TTS INTEGRATION
 * 
 * Converts Friday's text responses to Danish voice audio
 * Uses ElevenLabs API with cached audio files
 * 
 * @author Friday (AI Agent)
 * @created 2026-02-06
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class TTSEngine {
    constructor() {
        // ElevenLabs config (from OpenClaw context)
        this.voiceId = 'pFZP5JQG7iQjIQuC4Bku'; // Dansk stemme
        this.model = 'eleven_multilingual_v2';
        this.language = 'da'; // Danish
        
        // Cache directory for audio files
        this.cacheDir = path.join(__dirname, 'audio-cache');
        this.ensureCacheDir();
    }
    
    ensureCacheDir() {
        if (!fs.existsSync(this.cacheDir)) {
            fs.mkdirSync(this.cacheDir, { recursive: true });
            console.log('📁 Created audio cache directory');
        }
    }
    
    /**
     * Generate audio from text using OpenClaw's TTS tool
     * @param {string} text - Text to convert to speech
     * @returns {Promise<string>} Path to audio file
     */
    async generateAudio(text) {
        // Use OpenClaw's built-in TTS (it has ElevenLabs integration)
        return new Promise((resolve, reject) => {
            const timestamp = Date.now();
            const filename = `friday-${timestamp}.mp3`;
            const outputPath = path.join(this.cacheDir, filename);
            
            // Use echo + OpenClaw TTS tool
            const command = `echo "${text.replace(/"/g, '\\"')}" | openclaw tts > ${outputPath}`;
            
            console.log('🔊 Generating TTS audio...');
            
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error('❌ TTS generation failed:', error.message);
                    reject(error);
                    return;
                }
                
                if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
                    reject(new Error('TTS output file empty or missing'));
                    return;
                }
                
                console.log('✅ TTS audio generated:', filename);
                resolve(`/audio/${filename}`);
            });
        });
    }
    
    /**
     * Clean old cache files (keep last 100)
     */
    cleanCache() {
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
    }
}

module.exports = TTSEngine;
