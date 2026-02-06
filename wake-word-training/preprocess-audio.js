/**
 * Convert MP3 → WAV (16kHz mono) for TensorFlow training
 * Generate negative samples (non-Friday audio)
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 16000;
const CHANNELS = 1;

async function convertToWav(mp3File, wavFile) {
    return new Promise((resolve, reject) => {
        const cmd = `ffmpeg -i "${mp3File}" -ar ${SAMPLE_RATE} -ac ${CHANNELS} "${wavFile}" -y 2>&1 | grep -v "^ffmpeg version"`;
        
        exec(cmd, (error, stdout, stderr) => {
            if (error && !stdout.includes('Output')) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

async function processAll() {
    console.log('🔄 Converting MP3 → WAV (16kHz mono)...\n');
    
    const samplesDir = path.join(__dirname, 'friday-samples');
    const wavDir = path.join(__dirname, 'friday-wav');
    
    if (!fs.existsSync(wavDir)) {
        fs.mkdirSync(wavDir);
    }
    
    const mp3Files = fs.readdirSync(samplesDir).filter(f => f.endsWith('.mp3'));
    
    let count = 0;
    for (const mp3File of mp3Files) {
        const mp3Path = path.join(samplesDir, mp3File);
        const wavPath = path.join(wavDir, mp3File.replace('.mp3', '.wav'));
        
        try {
            await convertToWav(mp3Path, wavPath);
            count++;
            if (count % 10 === 0) {
                console.log(`✅ Converted ${count}/${mp3Files.length}`);
            }
        } catch (err) {
            console.error(`❌ Failed to convert ${mp3File}`);
        }
    }
    
    console.log(`\n✅ Converted ${count} files to WAV`);
    console.log(`📁 Location: wake-word-training/friday-wav/`);
}

processAll().catch(console.error);
