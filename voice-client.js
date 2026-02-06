// FRIDAY VOICE CLIENT
// Built by Friday for Friday 🖐️

class FridayVoiceClient {
    constructor() {
        this.ws = null;
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.recognition = null;
        
        this.init();
    }
    
    init() {
        this.setupUI();
        this.connectWebSocket();
        this.setupSpeechRecognition();
    }
    
    setupUI() {
        this.micBtn = document.getElementById('mic-btn');
        this.chatContainer = document.getElementById('chat');
        this.statusText = document.getElementById('status-text');
        this.thinkingIndicator = document.getElementById('thinking-indicator');
        
        this.micBtn.addEventListener('click', () => this.toggleRecording());
    }
    
    connectWebSocket() {
        // Connect to Friday's WebSocket server
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        this.ws = new WebSocket(`${protocol}//${host}/ws`);
        
        this.ws.onopen = () => {
            this.updateStatus('Connected to Friday 🟢', true);
            this.addMessage('friday', 'WebSocket connection established! Ready to talk.');
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
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }
    
    startRecording() {
        if (!this.recognition) {
            this.showError('Speech recognition not available');
            return;
        }
        
        this.isRecording = true;
        this.micBtn.classList.add('active');
        this.updateStatus('Listening... 🎤', true);
        
        try {
            this.recognition.start();
        } catch (e) {
            console.error('Failed to start recording:', e);
            this.stopRecording();
        }
    }
    
    stopRecording() {
        this.isRecording = false;
        this.micBtn.classList.remove('active');
        this.updateStatus('Connected to Friday 🟢', true);
        
        if (this.recognition) {
            this.recognition.stop();
        }
    }
    
    sendVoiceMessage(transcript) {
        // Add user message to chat
        this.addMessage('user', transcript);
        
        // Show thinking indicator
        this.thinkingIndicator.style.display = 'block';
        
        // Send to Friday server
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'voice_message',
                transcript: transcript,
                timestamp: Date.now()
            }));
        } else {
            this.showError('Not connected to server');
            this.thinkingIndicator.style.display = 'none';
        }
    }
    
    handleServerMessage(data) {
        this.thinkingIndicator.style.display = 'none';
        
        switch (data.type) {
            case 'friday_response':
                this.addMessage('friday', data.text);
                
                // Play audio if available
                if (data.audioUrl) {
                    this.playAudio(data.audioUrl);
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
    
    playAudio(audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play().catch(e => {
            console.error('Failed to play audio:', e);
        });
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
}

// Initialize Friday Voice Client when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.fridayClient = new FridayVoiceClient();
});
