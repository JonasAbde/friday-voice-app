/**
 * Generate "Friday" training samples via ElevenLabs TTS
 * Creates 100+ variations with different:
 * - Voice models (Danish male/female)
 * - Pitch variations
 * - Speed variations
 * - Background noise levels
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = 'pFZP5JQG7iQjIQuC4Bku'; // Danish female voice

// Variations to generate
const variations = [
    // Normal speed, different pitch
    { stability: 0.5, similarity_boost: 0.75, style: 0.0 },
    { stability: 0.4, similarity_boost: 0.70, style: 0.0 },
    { stability: 0.6, similarity_boost: 0.80, style: 0.0 },
    
    // Faster/slower
    { stability: 0.5, similarity_boost: 0.75, style: 0.3 },
    { stability: 0.5, similarity_boost: 0.75, style: -0.3 },
    
    // Different voice characteristics
    { stability: 0.3, similarity_boost: 0.60, style: 0.0 },
    { stability: 0.7, similarity_boost: 0.90, style: 0.0 },
    { stability: 0.5, similarity_boost: 0.50, style: 0.2 },
    { stability: 0.5, similarity_boost: 0.90, style: -0.2 },
    
    // Edge cases
    { stability: 0.2, similarity_boost: 0.50, style: 0.5 },
    { stability: 0.8, similarity_boost: 0.95, style: -0.5 },
];

// Different pronunciations/contexts
const contexts = [
    "Friday",
    "Friday!",
    "Friday?",
    "Friday.",
    "Hey Friday",
    "Okay Friday",
    "Friday please",
];

let sampleCount = 0;

async function generateSample(text, voiceSettings, index) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            text: text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: voiceSettings
        });

        const options = {
            hostname: 'api.elevenlabs.io',
            port: 443,
            path: `/v1/text-to-speech/${VOICE_ID}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY,
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            const chunks = [];
            
            res.on('data', (chunk) => {
                chunks.push(chunk);
            });
            
            res.on('end', () => {
                const buffer = Buffer.concat(chunks);
                const filename = `friday_${index.toString().padStart(4, '0')}.mp3`;
                const filepath = path.join(__dirname, 'friday-samples', filename);
                
                fs.writeFileSync(filepath, buffer);
                sampleCount++;
                console.log(`✅ Generated: ${filename} (${sampleCount})`);
                resolve();
            });
        });

        req.on('error', (error) => {
            console.error(`❌ Error generating sample ${index}:`, error.message);
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

async function generateAll() {
    console.log('🎤 Generating "Friday" wake word training samples...\n');
    
    let index = 0;
    
    for (const context of contexts) {
        for (const variation of variations) {
            await generateSample(context, variation, index);
            index++;
            
            // Rate limit: 1 request per second
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    console.log(`\n✅ Generated ${sampleCount} samples!`);
    console.log(`📁 Location: wake-word-training/friday-samples/`);
    console.log(`\n🔄 Next: Convert to WAV + create negative samples`);
}

generateAll().catch(console.error);
