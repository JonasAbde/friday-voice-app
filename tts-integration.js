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
     * @param {string} text - Text to convert to speech
     * @returns {Promise<string>} Path to audio file
     */
    async generateAudio(text) {
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
                }
            };
            
            console.log('🔊 Generating ElevenLabs TTS audio...');
            
            const req = https.request(url, options, (res) => {
                if (res.statusCode !== 200) {
                    console.error('❌ ElevenLabs API error:', res.statusCode);
                    reject(new Error(`API returned ${res.statusCode}`));
                    return;
                }
                
                const fileStream = fs.createWriteStream(outputPath);
                res.pipe(fileStream);
                
                fileStream.on('finish', () => {
                    fileStream.close();
                    console.log('✅ ElevenLabs audio generated:', filename);
                    resolve(`/audio/${filename}`);
                });
                
                fileStream.on('error', (err) => {
                    fs.unlink(outputPath, () => {});
                    reject(err);
                });
            });
            
            req.on('error', (err) => {
                console.error('❌ ElevenLabs request failed:', err.message);
                reject(err);
            });
            
            req.write(payload);
            req.end();
        });
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
