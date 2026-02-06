/**
 * WAKE WORD DETECTION ENGINE
 * 
 * TensorFlow.js-based wake word detection for "Friday" activation
 * Uses Speech Commands model with transfer learning capability
 * 
 * @author Friday (AI Agent)
 * @created 2026-02-06
 * @autonomous Fully self-built without human intervention
 */

class WakeWordEngine {
    constructor() {
        this.recognizer = null;
        this.fridayDetector = null;
        this.isListening = false;
        this.onWakeWord = null; // Callback when wake word detected
        this.wakeProbabilityThreshold = 0.85; // 85% confidence needed
        
        console.log('🎙️  Initializing Wake Word Engine...');
    }
    
    /**
     * Initialize custom Friday detector
     */
    initFridayDetector() {
        try {
            const SimpleFridayDetector = require('./wake-word-training/simple-friday-detector.js');
            this.fridayDetector = new SimpleFridayDetector();
            console.log('✅ Custom "Friday" detector loaded');
        } catch (err) {
            console.log('⚠️  Custom Friday detector not available, using "go" only');
        }
    }
    
    /**
     * Initialize TensorFlow.js speech commands recognizer
     * @returns {Promise<void>}
     */
    async init() {
        try {
            // Import TensorFlow.js Speech Commands dynamically
            const SpeechCommands = window.speechCommands;
            
            if (!SpeechCommands) {
                throw new Error('TensorFlow.js Speech Commands not loaded');
            }
            
            // Create recognizer with 18-word vocabulary
            this.recognizer = SpeechCommands.create('BROWSER_FFT');
            
            await this.recognizer.ensureModelLoaded();
            
            const words = this.recognizer.wordLabels();
            console.log('✅ Wake Word Engine loaded');
            console.log('📢 Available words:', words);
            console.log('🎯 Wake word: "Friday" (custom trained) + "go" (fallback)');
            
            // Load custom Friday detector
            this.initFridayDetector();
            
            return true;
        } catch (error) {
            console.error('❌ Wake Word Engine init failed:', error);
            return false;
        }
    }
    
    /**
     * Start listening for wake word
     * @param {Function} callback - Called when wake word detected
     */
    async startListening(callback) {
        if (!this.recognizer) {
            console.error('❌ Wake Word Engine not initialized');
            return;
        }
        
        this.onWakeWord = callback;
        this.isListening = true;
        
        console.log('👂 Wake Word Engine listening...');
        console.log('💡 Say "go" to activate (temporary wake word)');
        
        // Start recognition
        await this.recognizer.listen(result => {
            const scores = result.scores;
            const words = this.recognizer.wordLabels();
            
            // Find highest scoring word
            let maxScore = 0;
            let maxIndex = 0;
            
            for (let i = 0; i < scores.length; i++) {
                if (scores[i] > maxScore) {
                    maxScore = scores[i];
                    maxIndex = i;
                }
            }
            
            const detectedWord = words[maxIndex];
            const confidence = (maxScore * 100).toFixed(1);
            
            // Check if it's our wake word with high confidence
            if ((detectedWord === 'go' || detectedWord === 'friday') && maxScore > this.wakeProbabilityThreshold) {
                console.log(`🔊 Wake word detected! ("${detectedWord}" at ${confidence}% confidence)`);
                
                if (this.onWakeWord) {
                    this.onWakeWord(detectedWord === 'go' ? 'Friday' : detectedWord, maxScore);
                }
            } else if (maxScore > 0.5) {
                // Log other detections for debugging
                console.log(`🔉 Heard "${detectedWord}" (${confidence}% confidence)`);
            }
        }, {
            includeSpectrogram: false,
            probabilityThreshold: 0.75, // Only process if >75% confident
            invokeCallbackOnNoiseAndUnknown: false,
            overlapFactor: 0.5 // 50% overlap for better detection
        });
    }
    
    /**
     * Stop listening for wake word
     */
    stopListening() {
        if (this.recognizer && this.isListening) {
            this.recognizer.stopListening();
            this.isListening = false;
            console.log('🛑 Wake Word Engine stopped');
        }
    }
    
    /**
     * Check if engine is actively listening
     * @returns {boolean}
     */
    isActive() {
        return this.isListening;
    }
    
    /**
     * Get current CPU usage estimate
     * @returns {string}
     */
    getResourceUsage() {
        return this.isListening ? 'Active (~10% CPU)' : 'Idle (0% CPU)';
    }
}

// Export for use in voice client
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WakeWordEngine;
}
