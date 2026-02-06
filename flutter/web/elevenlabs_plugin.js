/**
 * ElevenLabsPlugin - Web implementation for ElevenLabs TTS
 * 
 * Handles API calls to ElevenLabs and audio playback in browsers
 * Provides high-quality neural TTS with voice cloning support
 */
class ElevenLabsPlugin {
  constructor() {
    this.apiKey = null;
    this.defaultVoiceId = null;
    this.audioElement = null;
    this.baseUrl = 'https://api.elevenlabs.io/v1';
  }

  /**
   * Register the plugin with Flutter Web
   */
  static register() {
    const plugin = new ElevenLabsPlugin();
    window.elevenLabsPlugin = plugin;
    
    // Register method channel handler
    window.addEventListener('message', (event) => {
      if (event.data.type === 'elevenlabs') {
        plugin.handleMethodCall(event.data.method, event.data.args)
          .then(result => {
            window.postMessage({
              type: 'elevenlabs-result',
              id: event.data.id,
              result: result
            }, '*');
          })
          .catch(error => {
            window.postMessage({
              type: 'elevenlabs-error',
              id: event.data.id,
              error: error.message
            }, '*');
          });
      }
    });
  }

  /**
   * Handle method calls from Flutter
   */
  async handleMethodCall(method, args) {
    switch (method) {
      case 'initialize':
        return this.initialize(args.apiKey, args.voiceId);
      
      case 'speak':
        return this.speak(args.text, args.voiceId);
      
      case 'stop':
        return this.stop();
      
      case 'getVoices':
        return this.getVoices();
      
      default:
        throw new Error(`Method ${method} not implemented`);
    }
  }

  /**
   * Initialize the plugin
   */
  async initialize(apiKey, voiceId) {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    
    this.apiKey = apiKey;
    this.defaultVoiceId = voiceId;
    return true;
  }

  /**
   * Synthesize and play speech
   */
  async speak(text, voiceId) {
    if (!this.apiKey) {
      throw new Error('ElevenLabs not initialized');
    }

    if (!text) {
      throw new Error('Text is required');
    }

    const voice = voiceId || this.defaultVoiceId;
    if (!voice) {
      throw new Error('Voice ID is required');
    }

    try {
      // Make API request
      const response = await fetch(`${this.baseUrl}/text-to-speech/${voice}`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      // Get audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Play audio
      return this.playAudio(audioUrl);

    } catch (error) {
      throw new Error(`Synthesis failed: ${error.message}`);
    }
  }

  /**
   * Play audio from URL
   */
  playAudio(audioUrl) {
    return new Promise((resolve, reject) => {
      // Stop any existing playback
      this.stop();

      // Create audio element
      this.audioElement = new Audio(audioUrl);
      
      this.audioElement.addEventListener('ended', () => {
        URL.revokeObjectURL(audioUrl);
        resolve(true);
      });

      this.audioElement.addEventListener('error', (error) => {
        URL.revokeObjectURL(audioUrl);
        reject(new Error(`Playback error: ${error.message}`));
      });

      // Start playback
      this.audioElement.play().catch(reject);
    });
  }

  /**
   * Stop current playback
   */
  stop() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement = null;
    }
    return true;
  }

  /**
   * Get available voices
   */
  async getVoices() {
    if (!this.apiKey) {
      throw new Error('ElevenLabs not initialized');
    }

    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        method: 'GET',
        headers: {
          'xi-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.voices.map(voice => ({
        voice_id: voice.voice_id,
        name: voice.name,
        category: voice.category || 'unknown',
        description: voice.description || ''
      }));

    } catch (error) {
      throw new Error(`Failed to fetch voices: ${error.message}`);
    }
  }
}

// Auto-register when script loads
if (typeof window !== 'undefined') {
  ElevenLabsPlugin.register();
}
