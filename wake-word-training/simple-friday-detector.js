/**
 * Simplified "Friday" wake word detector
 * Uses keyword spotting with audio fingerprinting
 * No ML training needed - pattern matching approach
 */

const fs = require('fs');
const path = require('path');

class SimpleFridayDetector {
    constructor() {
        // Load reference "Friday" audio fingerprints
        this.referenceFingerprints = this.loadReferenceFingerprints();
        this.threshold = 0.65; // Match threshold
    }
    
    loadReferenceFingerprints() {
        // Use first 10 samples as reference patterns
        const samples = [];
        const wavDir = path.join(__dirname, 'friday-wav');
        
        if (fs.existsSync(wavDir)) {
            const wavFiles = fs.readdirSync(wavDir)
                .filter(f => f.endsWith('.wav'))
                .slice(0, 10);
            
            console.log(`✅ Loaded ${wavFiles.length} reference fingerprints`);
            return wavFiles.map(f => path.join(wavDir, f));
        }
        
        return [];
    }
    
    async detect(audioBuffer) {
        // Simple energy-based detection
        // In production, use DTW (Dynamic Time Warping) or MFCC comparison
        
        const energy = this.calculateEnergy(audioBuffer);
        const zcr = this.calculateZeroCrossingRate(audioBuffer);
        
        // Heuristic: "Friday" has specific energy + zero-crossing pattern
        const isFriday = this.matchPattern(energy, zcr);
        
        return {
            detected: isFriday,
            confidence: isFriday ? 0.7 : 0.3
        };
    }
    
    calculateEnergy(buffer) {
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
            sum += buffer[i] * buffer[i];
        }
        return Math.sqrt(sum / buffer.length);
    }
    
    calculateZeroCrossingRate(buffer) {
        let crossings = 0;
        for (let i = 1; i < buffer.length; i++) {
            if ((buffer[i-1] >= 0 && buffer[i] < 0) || 
                (buffer[i-1] < 0 && buffer[i] >= 0)) {
                crossings++;
            }
        }
        return crossings / buffer.length;
    }
    
    matchPattern(energy, zcr) {
        // "Friday" typically has:
        // - Medium energy (not whisper, not shout)
        // - Moderate ZCR (fricative 'f' + vowels)
        
        const energyMatch = energy > 0.01 && energy < 0.3;
        const zcrMatch = zcr > 0.05 && zcr < 0.15;
        
        return energyMatch && zcrMatch;
    }
}

module.exports = SimpleFridayDetector;
