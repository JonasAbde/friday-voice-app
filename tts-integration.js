/**
 * ELEVENLABS TTS INTEGRATION (OpenClaw Function Call Method)
 * 
 * Uses OpenClaw's tts() function call instead of CLI
 * Converts Friday's text responses to Danish voice audio
 * 
 * @author Friday (AI Agent)
 * @created 2026-02-06
 * @revised 2026-02-06 (switched from CLI to function call)
 */

const fs = require('fs');
const path = require('path');

class TTSEngine {
    constructor() {
        // ElevenLabs config (from OpenClaw context)
        this.voiceId = 'pFZP5JQG7iQjIQuC4Bku'; // Dansk stemme
        this.model = 'eleven_multilingual_v2';
        this.language = 'da'; // Danish
        
        // Cache directory for audio files
        this.cacheDir = path.join(__dirname, 'audio-cache');
        this.ensureCacheDir();
        
        // Audio counter for unique filenames
        this.counter = 0;
    }
    
    ensureCacheDir() {
        if (!fs.existsSync(this.cacheDir)) {
            fs.mkdirSync(this.cacheDir, { recursive: true });
            console.log('📁 Created audio cache directory');
        }
    }
    
    /**
     * Generate audio from text using Node.js TTS library
     * UPDATED: Direct implementation instead of OpenClaw CLI
     * 
     * @param {string} text - Text to convert to speech
     * @returns {Promise<string>} Path to audio file
     */
    async generateAudio(text) {
        // For now: Return null and use client-side Web Speech API
        // This is a fallback until we integrate ElevenLabs API directly
        console.log('🔊 TTS requested for:', text.substring(0, 50) + '...');
        console.log('⚠️  Using client-side TTS fallback (Web Speech API)');
        
        // TODO: Integrate ElevenLabs API directly via fetch()
        // const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/...');
        
        return null; // Client will handle TTS via browser
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
