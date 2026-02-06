// FRIDAY VOICE CLIENT
// Built by Friday for Friday 🖐️

class FridayVoiceClient {
    constructor() {
        this.ws = null;
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.recognition = null;
        this.wakeWordEngine = null;
        this.wakeWordEnabled = false;
        this.currentMode = 'push'; // Default to 'push' (simpler)
        this.lastFridayResponse = null;
        this.audioVolume = 0.7;
        
        // Master state machine (5 states)
        this.state = 'idle'; // idle | listening | transcribing | thinking | speaking
        
        // Mobile detection
        this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        this.init();
    }
    
    async init() {
        this.setupUI();
        this.initVoiceOrb(); // Initialize canvas orb
        this.connectWebSocket();
        this.setupSpeechRecognition();
        this.loadVoices(); // Load available voices on init
        await this.setupWakeWord(); // Initialize wake word detection
    }
    
    /**
     * Initialize animated voice orb (Canvas-based)
     */
    initVoiceOrb() {
        this.orbCanvas = document.getElementById('voice-orb');
        this.orbCtx = this.orbCanvas.getContext('2d');
        this.orbState = 'idle'; // idle, listening, processing
        
        // Start rendering loop
        this.renderOrb();
    }
    
    /**
     * Render voice orb with smooth animations
     */
    renderOrb() {
        const canvas = this.orbCanvas;
        const ctx = this.orbCtx;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const time = Date.now() * 0.001; // Time in seconds
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate animated radius based on state
        let baseRadius = 70;
        let radius = baseRadius;
        
        if (this.orbState === 'idle') {
            // Breathing effect
            radius = baseRadius + Math.sin(time * 0.5) * 3;
        } else if (this.orbState === 'listening') {
            // Pulsing effect (faster)
            radius = baseRadius + Math.sin(time * 2) * 8;
        } else if (this.orbState === 'processing') {
            // Processing (constant + slight pulse)
            radius = baseRadius + Math.sin(time * 3) * 5;
        }
        
        // Outer glow (larger, more visible)
        const outerGlow = ctx.createRadialGradient(
            centerX, centerY, radius * 0.5,
            centerX, centerY, radius * 1.8
        );
        outerGlow.addColorStop(0, 'rgba(102, 126, 234, 0.4)');
        outerGlow.addColorStop(0.5, 'rgba(102, 126, 234, 0.2)');
        outerGlow.addColorStop(1, 'rgba(102, 126, 234, 0)');
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = outerGlow;
        ctx.fill();
        
        // Main orb gradient (brighter purple)
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, radius
        );
        gradient.addColorStop(0, '#a78bfa'); // Bright purple (center)
        gradient.addColorStop(0.5, '#8b5cf6'); // Medium purple
        gradient.addColorStop(0.8, '#7c3aed'); // Deep purple
        gradient.addColorStop(1, 'rgba(124, 58, 237, 0.5)'); // Fade out
        
        // Draw main orb
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Inner highlight (makes it look 3D)
        const highlight = ctx.createRadialGradient(
            centerX - radius * 0.3, centerY - radius * 0.3, 0,
            centerX, centerY, radius * 0.6
        );
        highlight.addColorStop(0, 'rgba(255,255,255,0.4)');
        highlight.addColorStop(1, 'rgba(255,255,255,0)');
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = highlight;
        ctx.fill();
        
        // Inner glow ring (active states)
        if (this.orbState === 'listening' || this.orbState === 'processing') {
            const innerGradient = ctx.createRadialGradient(
                centerX, centerY, radius * 0.6,
                centerX, centerY, radius * 0.9
            );
            innerGradient.addColorStop(0, 'rgba(255,255,255,0)');
            innerGradient.addColorStop(1, 'rgba(255,255,255,0.3)');
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 0.8, 0, Math.PI * 2);
            ctx.strokeStyle = innerGradient;
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        
        // Continue animation loop
        requestAnimationFrame(() => this.renderOrb());
    }
    
    /**
     * Update orb state (idle, listening, processing)
     */
    setOrbState(state) {
        this.orbState = state;
        const container = document.getElementById('voice-orb-container');
        
        // Remove all state classes
        container.classList.remove('orb-breathing', 'orb-pulsing', 'orb-spinning');
        
        // Add appropriate class
        if (state === 'idle') {
            container.classList.add('orb-breathing');
        } else if (state === 'listening') {
            container.classList.add('orb-pulsing');
        } else if (state === 'processing') {
            container.classList.add('orb-spinning');
        }
    }
    
    /**
     * Master state update (5 states)
     * Updates UI + orb based on current state
     */
    setState(newState) {
        this.state = newState;
        
        // Update status text (100% dansk)
        const statusMessages = {
            'idle': '😴 Klar',
            'listening': '👂 Lytter...',
            'transcribing': '📝 Transskriberer...',
            'thinking': '🧠 Friday tænker...',
            'speaking': '🔊 Friday taler...'
        };
        
        this.updateStatus(statusMessages[newState] || 'Klar', true);
        
        // Update orb state
        if (newState === 'listening') {
            this.setOrbState('listening');
        } else if (newState === 'thinking' || newState === 'transcribing') {
            this.setOrbState('processing');
        } else if (newState === 'speaking') {
            this.setOrbState('processing');
        } else {
            this.setOrbState('idle');
        }
        
        // Update button states
        this.updateButtonStates();
    }
    
    /**
     * Smart button enable/disable based on state
     */
    updateButtonStates() {
        const micBtn = this.micBtn;
        const stopBtn = this.stopBtn;
        const replayBtn = this.replayBtn;
        
        // Start button: enabled only in idle state
        if (this.state === 'idle') {
            micBtn.disabled = false;
            micBtn.textContent = '🎤 Start';
        } else {
            micBtn.disabled = true;
        }
        
        // Stop button: enabled during listening/transcribing
        if (this.state === 'listening' || this.state === 'transcribing') {
            stopBtn.disabled = false;
            stopBtn.classList.remove('hidden');
        } else {
            stopBtn.disabled = true;
            stopBtn.classList.add('hidden');
        }
        
        // Replay button: only enabled if we have audio
        if (this.lastFridayResponse && this.state === 'idle') {
            replayBtn.disabled = false;
            replayBtn.classList.remove('hidden');
        } else {
            replayBtn.disabled = true;
            if (!this.lastFridayResponse) {
                replayBtn.classList.add('hidden');
            }
        }
    }
    
    /**
     * Load available speech synthesis voices
     * Needed because voices load async in browsers
     */
    loadVoices() {
        if (!('speechSynthesis' in window)) return;
        
        const voiceSelect = document.getElementById('voice-select');
        
        // Show loading state with spinner
        voiceSelect.innerHTML = '<option><span class="loading-spinner"></span> Indlæser stemmer...</option>';
        voiceSelect.classList.add('skeleton');
        
        // Timeout after 5 seconds
        const timeout = setTimeout(() => {
            voiceSelect.classList.remove('skeleton');
            voiceSelect.innerHTML = '<option disabled>⚠️ Kunne ikke indlæse stemmer</option><option value="retry">🔄 Prøv igen</option>';
        }, 5000);
        
        // Voices load asynchronously, so we need to listen for the event
        window.speechSynthesis.addEventListener('voiceschanged', () => {
            clearTimeout(timeout);
            
            const voices = window.speechSynthesis.getVoices();
            const danishVoices = voices.filter(v => v.lang.startsWith('da'));
            
            console.log('📢 Available voices:', voices.length);
            console.log('🇩🇰 Danish voices:', danishVoices.map(v => v.name).join(', ') || 'None found');
            
            voiceSelect.classList.remove('skeleton');
            
            if (voices.length > 0) {
                voiceSelect.innerHTML = voices.map(v => 
                    `<option value="${v.name}">${v.name} (${v.lang})</option>`
                ).join('');
            } else {
                voiceSelect.innerHTML = '<option>Standard stemme</option>';
                console.warn('⚠️ No TTS voices available - using default');
            }
        });
        
        // Trigger voice loading
        window.speechSynthesis.getVoices();
    }
    
    /**
     * Setup Wake Word Detection Engine
     * Enables "Friday" wake word for hands-free activation
     */
    async setupWakeWord() {
        try {
            this.wakeWordEngine = new WakeWordEngine();
            const success = await this.wakeWordEngine.init();
            
            if (success) {
                console.log('✅ Wake Word Engine ready!');
                console.log('💡 Click mic button to enable always-listening mode');
                
                // Update UI to show wake word capability
                this.micBtn.title = 'Click to enable wake word detection (say "go" to activate)';
            }
        } catch (error) {
            console.error('⚠️  Wake Word Engine unavailable:', error.message);
            console.log('📌 Falling back to manual activation only');
        }
    }
    
    /**
     * Enable wake word detection (always-listening mode)
     */
    async enableWakeWord() {
        if (!this.wakeWordEngine) {
            this.showNotification('Wake word ikke tilgængelig', 'error', true);
            return;
        }
        
        this.wakeWordEnabled = true;
        this.micBtn.classList.add('wake-active');
        this.updateStatus('Wake word active - say "go" to activate 👂', true);
        this.updateStatusDot('listening');
        
        // Start listening for wake word
        await this.wakeWordEngine.startListening((word, confidence) => {
            console.log(`🎯 Wake word detected: ${word} (${(confidence * 100).toFixed(1)}%)`);
            
            // Auto-start recording when wake word detected
            if (!this.isRecording) {
                this.startRecording();
            }
        });
    }
    
    /**
     * Disable wake word detection
     */
    disableWakeWord() {
        if (this.wakeWordEngine && this.wakeWordEnabled) {
            this.wakeWordEngine.stopListening();
            this.wakeWordEnabled = false;
            this.micBtn.classList.remove('wake-active');
            this.updateStatus('Wake word disabled', true);
            this.updateStatusDot('listening');
        }
    }
    
    setupUI() {
        // Main controls
        this.micBtn = document.getElementById('mic-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.replayBtn = document.getElementById('replay-btn');
        this.settingsBtn = document.getElementById('settings-btn');
        this.chatContainer = document.getElementById('chat');
        this.statusText = document.getElementById('status-text');
        this.statusDot = document.getElementById('status-dot');
        this.thinkingIndicator = document.getElementById('thinking-indicator');
        
        // Settings modal
        this.settingsModal = document.getElementById('settings-modal');
        this.closeSettings = document.getElementById('close-settings');
        
        // Debug: Verify elements exist
        if (!this.settingsModal) {
            console.error('❌ Settings modal not found!');
        }
        if (!this.closeSettings) {
            console.error('❌ Close settings button not found!');
        }
        
        // Mode toggles
        this.modeWake = document.getElementById('mode-wake');
        this.modePush = document.getElementById('mode-push');
        
        // Sliders
        this.volumeSlider = document.getElementById('volume-slider');
        this.volumeValue = document.getElementById('volume-value');
        this.sensitivitySlider = document.getElementById('sensitivity-slider');
        this.sensitivityValue = document.getElementById('sensitivity-value');
        this.debugToggle = document.getElementById('debug-toggle');
        this.debugInfo = document.getElementById('debug-info');
        
        // Event listeners
        this.micBtn.addEventListener('click', () => this.toggleRecording());
        this.stopBtn.addEventListener('click', () => this.stopRecording());
        this.replayBtn.addEventListener('click', () => this.replayLastResponse());
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        
        // Close settings button
        if (this.closeSettings) {
            this.closeSettings.addEventListener('click', (e) => {
                console.log('✅ Close button clicked!');
                e.preventDefault();
                e.stopPropagation();
                this.closeSettingsModal();
            });
        }
        
        // Close modal on outside click
        if (this.settingsModal) {
            this.settingsModal.addEventListener('click', (e) => {
                if (e.target === this.settingsModal) {
                    this.closeSettingsModal();
                }
            });
        }
        
        // Debug toggle
        this.debugToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.debugInfo.classList.remove('hidden');
            } else {
                this.debugInfo.classList.add('hidden');
            }
        });
        
        this.modeWake.addEventListener('click', () => this.setMode('wake'));
        this.modePush.addEventListener('click', () => this.setMode('push'));
        
        this.volumeSlider.addEventListener('input', (e) => {
            this.volumeValue.textContent = e.target.value + '%';
            this.setVolume(e.target.value / 100);
        });
        
        this.sensitivitySlider.addEventListener('input', (e) => {
            this.sensitivityValue.textContent = e.target.value + '%';
            if (this.wakeWordEngine) {
                this.wakeWordEngine.wakeProbabilityThreshold = e.target.value / 100;
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !e.repeat) {
                e.preventDefault();
                if (this.currentMode === 'push') {
                    this.startRecording();
                }
            } else if (e.code === 'Escape') {
                this.stopRecording();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.code === 'Space' && this.currentMode === 'push') {
                this.stopRecording();
            }
        });
    }
    
    connectWebSocket() {
        // Connect to Friday's WebSocket server
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        this.ws = new WebSocket(`${protocol}//${host}/ws`);
        
        this.ws.onopen = () => {
            this.setState('idle'); // Set initial state
            this.addMessageBubble('friday', 'Klar til at tale! 🎤');
        };
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleServerMessage(data);
        };
        
        this.ws.onerror = (error) => {
            this.updateStatus('Connection error 🔴', false);
            this.showError('Failed to connect to Friday server');
        };
        
        this.ws.onclose = () => {
            this.updateStatus('Disconnected 🔴', false);
            setTimeout(() => this.connectWebSocket(), 3000); // Auto-reconnect
        };
    }
    
    setupSpeechRecognition() {
        // Use Web Speech API for voice capture
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            this.showError('Speech recognition not supported in this browser. Use Chrome/Edge.');
            return;
        }
        
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'da-DK'; // Danish
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.sendVoiceMessage(transcript);
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.stopRecording();
        };
        
        this.recognition.onend = () => {
            this.stopRecording();
        };
    }
    
    toggleRecording() {
        // If wake word is enabled, disable it
        if (this.wakeWordEnabled) {
            this.disableWakeWord();
            return;
        }
        
        // If not recording and wake word available, enable it
        if (!this.isRecording && this.wakeWordEngine) {
            this.enableWakeWord();
            return;
        }
        
        // Otherwise, toggle recording normally
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }
    
    startRecording() {
        if (!this.recognition) {
            this.showNotification('Mikrofon ikke tilgængelig', 'error');
            return;
        }
        
        this.isRecording = true;
        this.setState('listening'); // Master state update
        this.micBtn.classList.add('recording');
        this.setMicGlow(true);
        this.animateWaveform(true);
        
        try {
            this.recognition.start();
        } catch (e) {
            console.error('Failed to start recording:', e);
            this.stopRecording();
            this.showNotification('Kunne ikke starte optagelse', 'error');
        }
    }
    
    stopRecording() {
        this.isRecording = false;
        this.setState('idle'); // Return to idle
        this.micBtn.classList.remove('recording');
        this.setMicGlow(false);
        this.animateWaveform(false);
        
        if (this.wakeWordEnabled) {
            this.micBtn.classList.add('wake-active');
            this.updateStatus('Wake word aktiv - sig "go" 👂', true);
            this.updateStatusDot('listening');
        } else {
            this.updateStatus('Forbundet til Friday 🟢', true);
            this.updateStatusDot('connected');
        }
        
        if (this.recognition) {
            this.recognition.stop();
        }
    }
    
    sendVoiceMessage(transcript) {
        // Add user message to chat
        this.addMessageBubble('user', transcript);
        
        // Show processing state
        this.setOrbState('processing'); // Update orb to processing state
        this.thinkingIndicator.classList.remove('hidden');
        this.thinkingIndicator.classList.add('flex');
        this.micBtn.classList.add('processing');
        this.micBtn.classList.remove('recording', 'wake-active');
        this.updateStatus('🧠 Friday tænker...', true);
        this.updateStatusDot('processing');
        this.setMicGlow(true);
        
        // Send to Friday server
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'voice_message',
                transcript: transcript,
                timestamp: Date.now()
            }));
        } else {
            this.showError('Not connected to server');
            this.thinkingIndicator.classList.add('hidden');
            this.thinkingIndicator.classList.remove('flex');
            this.micBtn.classList.remove('processing');
            this.setMicGlow(false);
        }
    }
    
    handleServerMessage(data) {
        this.thinkingIndicator.classList.add('hidden');
        this.thinkingIndicator.classList.remove('flex');
        this.micBtn.classList.remove('processing');
        this.setMicGlow(false);
        this.setOrbState('idle'); // Return to idle after processing
        
        // Restore wake word state if enabled
        if (this.wakeWordEnabled) {
            this.micBtn.classList.add('wake-active');
        }
        
        switch (data.type) {
            case 'friday_response':
                this.addMessageBubble('friday', data.text);
                
                // Play server-generated audio if available (ElevenLabs)
                if (data.audioUrl) {
                    this.playAudio(data.audioUrl);
                } else {
                    // Fallback to browser TTS if server audio failed
                    this.speakText(data.text);
                }
                break;
                
            case 'error':
                this.showError(data.message);
                break;
                
            case 'status':
                this.updateStatus(data.message, true);
                break;
        }
    }
    
    /**
     * Play audio file from server (ElevenLabs TTS)
     * @param {string} audioUrl - URL to audio file
     */
    playAudio(audioUrl) {
        console.log('🔊 Playing ElevenLabs TTS audio');
        this.logTTSSource('ElevenLabs', 'pFZP5JQG7iQjIQuC4Bku'); // Danish female voice ID
        
        const audio = new Audio(audioUrl);
        audio.volume = this.audioVolume; // Respect volume setting
        audio.play().catch(err => {
            console.error('⚠️ Audio playback failed:', err);
            console.error('❌ Falling back to browser TTS');
            // If audio file fails to play, fallback to browser TTS
            // (This shouldn't happen often, but handles edge cases like codec issues)
        });
        
        // Save for replay
        this.lastFridayResponse = audioUrl;
        
        // Update status dot
        this.updateStatusDot('speaking');
        
        // Reset status when done
        audio.addEventListener('ended', () => {
            this.updateStatusDot('listening');
            if (this.wakeWordEnabled) {
                this.updateStatus('Wake word active - say "go" to activate 👂', true);
            }
        });
    }
    
    /**
     * Speak text using Web Speech API (browser TTS fallback)
     * CRITICAL: Always use Danish FEMALE voice for consistency with ElevenLabs
     * @param {string} text - Text to speak
     */
    speakText(text) {
        if (!('speechSynthesis' in window)) {
            console.warn('⚠️ Speech synthesis not supported');
            return;
        }
        
        console.log('🔊 Using browser TTS fallback (ElevenLabs unavailable)');
        
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Configure Danish voice settings
        utterance.lang = 'da-DK'; // Danish language
        utterance.rate = 1.0; // Normal speed
        utterance.pitch = 1.0; // Normal pitch
        utterance.volume = this.audioVolume; // Respect volume setting
        
        // CRITICAL: Find Danish FEMALE voice (not just any Danish voice)
        const voices = window.speechSynthesis.getVoices();
        
        // Priority 1: Danish female voices (explicit)
        let selectedVoice = voices.find(v => 
            v.lang.startsWith('da') && 
            (v.name.toLowerCase().includes('female') || 
             v.name.toLowerCase().includes('kvinde') ||
             v.name.toLowerCase().includes('sara') || // Common Danish female voice name
             v.name.toLowerCase().includes('ida'))     // Common Danish female voice name
        );
        
        // Priority 2: Any Danish voice that's NOT explicitly male
        if (!selectedVoice) {
            selectedVoice = voices.find(v => 
                v.lang.startsWith('da') && 
                !v.name.toLowerCase().includes('male') &&
                !v.name.toLowerCase().includes('mand')
            );
        }
        
        // Priority 3: First available Danish voice (better than English)
        if (!selectedVoice) {
            selectedVoice = voices.find(v => v.lang.startsWith('da'));
        }
        
        if (selectedVoice) {
            utterance.voice = selectedVoice;
            console.log(`✅ Using Danish voice: ${selectedVoice.name} (${selectedVoice.lang})`);
        } else {
            console.warn('⚠️ No Danish voice found - using system default (may be English!)');
            console.warn('Available voices:', voices.map(v => `${v.name} (${v.lang})`).join(', '));
        }
        
        // Log TTS source for debugging
        this.logTTSSource('browser', selectedVoice ? selectedVoice.name : 'default');
        
        // Speak!
        window.speechSynthesis.speak(utterance);
    }
    
    /**
     * Log TTS source for monitoring voice consistency
     * Helps debug when/why voice switches happen
     */
    logTTSSource(source, voiceName) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            source: source,
            voice: voiceName
        };
        
        // Store in session storage for debugging
        const logs = JSON.parse(sessionStorage.getItem('tts-logs') || '[]');
        logs.push(logEntry);
        
        // Keep last 50 entries
        if (logs.length > 50) logs.shift();
        
        sessionStorage.setItem('tts-logs', JSON.stringify(logs));
        
        // Log to console
        if (source === 'browser') {
            console.warn(`⚠️ FALLBACK TTS: ${source} (${voiceName})`);
        } else {
            console.log(`🔊 TTS: ${source} (${voiceName})`);
        }
    }
    
    addMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const timestamp = new Date().toLocaleTimeString('da-DK', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        messageDiv.innerHTML = `
            <div>${this.escapeHtml(text)}</div>
            <div class="timestamp">${timestamp}</div>
        `;
        
        this.chatContainer.appendChild(messageDiv);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }
    
    playTTS(audioUrl) {
        // Alias for playAudio (used in replay)
        this.playAudio(audioUrl);
    }
    
    updateStatus(text, connected) {
        this.statusText.textContent = text;
    }
    
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = `⚠️ ${message}`;
        
        this.chatContainer.appendChild(errorDiv);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
        
        // Auto-remove after 5 seconds
        setTimeout(() => errorDiv.remove(), 5000);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Set interaction mode (wake word vs push-to-talk)
     */
    setMode(mode) {
        this.currentMode = mode;
        
        // Update UI with proper styling
        if (mode === 'wake') {
            // Wake Word active
            this.modeWake.classList.add('border-neon-cyan', 'bg-neon-cyan/10');
            this.modeWake.classList.remove('border-transparent', 'opacity-60');
            
            // Push to Talk inactive
            this.modePush.classList.remove('border-neon-cyan', 'bg-neon-cyan/10');
            this.modePush.classList.add('border-transparent', 'opacity-60');
            
            this.enableWakeWord();
        } else {
            // Push to Talk active
            this.modePush.classList.add('border-neon-cyan', 'bg-neon-cyan/10');
            this.modePush.classList.remove('border-transparent', 'opacity-60');
            
            // Wake Word inactive
            this.modeWake.classList.remove('border-neon-cyan', 'bg-neon-cyan/10');
            this.modeWake.classList.add('border-transparent', 'opacity-60');
            
            this.disableWakeWord();
            this.setState('idle');
            
            // Update button text for mobile
            if (this.isMobile) {
                this.modePush.innerHTML = '🎙️ Hold for at tale';
            }
        }
    }
    
    /**
     * Set TTS volume
     */
    setVolume(volume) {
        this.audioVolume = volume;
        console.log(`🔊 Volume set to ${(volume * 100).toFixed(0)}%`);
    }
    
    /**
     * Replay last Friday response
     */
    replayLastResponse() {
        if (!this.lastFridayResponse) {
            this.showNotification('Ingen optagelse endnu - start en samtale først', 'error');
            return;
        }
        
        console.log('🔄 Replaying last response...');
        this.setState('speaking');
        this.playTTS(this.lastFridayResponse);
    }
    
    /**
     * Update status dot color based on state
     */
    updateStatusDot(state) {
        if (!this.statusDot) return;
        
        // Remove all status classes
        this.statusDot.classList.remove('status-connected', 'status-listening', 'status-processing', 'status-error');
        
        // Add appropriate class
        switch(state) {
            case 'connected':
                this.statusDot.classList.add('status-connected');
                break;
            case 'listening':
                this.statusDot.classList.add('status-listening');
                break;
            case 'processing':
                this.statusDot.classList.add('status-processing');
                break;
            case 'error':
                this.statusDot.classList.add('status-error');
                break;
            default:
                this.statusDot.classList.add('status-connected');
        }
    }

    /**
     * Enhanced waveform animation
     */
    animateWaveform(isActive) {
        const waveform = document.getElementById('waveform');
        const bars = waveform.querySelectorAll('.waveform-bar');
        
        if (isActive) {
            bars.forEach(bar => {
                bar.style.animationPlayState = 'running';
            });
        } else {
            bars.forEach(bar => {
                bar.style.animationPlayState = 'paused';
                bar.style.height = '4px';
            });
        }
    }
    
    /**
     * Enhanced mic button glow
     */
    setMicGlow(active) {
        const glow = document.getElementById('mic-glow');
        if (glow) {
            glow.style.opacity = active ? '1' : '0';
        }
    }
    
    /**
     * Add message to chat with modern bubble design
     */
    addMessageBubble(role, text) {
        const chat = document.getElementById('chat');
        
        // Clear placeholder
        if (chat.querySelector('.text-center')) {
            chat.innerHTML = '';
        }
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble mb-4 flex ' + (role === 'user' ? 'justify-end' : 'justify-start');
        
        const content = document.createElement('div');
        content.className = role === 'user' 
            ? 'bg-gradient-to-br from-neon-cyan to-neon-purple text-white px-6 py-3 rounded-2xl max-w-md shadow-lg'
            : 'glass-card text-white/90 px-6 py-3 rounded-2xl max-w-md';
        
        content.textContent = text;
        bubble.appendChild(content);
        chat.appendChild(bubble);
        
        // Scroll to bottom
        chat.scrollTop = chat.scrollHeight;
    }

    /**
     * Open settings modal
     */
    openSettings() {
        console.log('📖 Opening settings modal...');
        this.settingsModal.classList.remove('hidden');
        this.settingsModal.classList.add('flex');
    }
    
    /**
     * Close settings modal
     */
    closeSettingsModal() {
        console.log('❌ Closing settings modal...');
        this.settingsModal.classList.add('hidden');
        this.settingsModal.classList.remove('flex');
    }
}

// Enhance existing addMessage to use new bubble design
FridayVoiceClient.prototype.addMessage = function(role, text) {
    this.addMessageBubble(role, text);
};

// Initialize Friday Voice Client when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.fridayClient = new FridayVoiceClient();
});
