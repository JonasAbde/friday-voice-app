# 🖐️ Friday Voice App

**Real-time voice chat with Friday AI assistant**

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/JonasAbde/friday-voice-app/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![CI](https://github.com/JonasAbde/friday-voice-app/workflows/Friday%20Voice%20App%20CI%2FCD/badge.svg)](https://github.com/JonasAbde/friday-voice-app/actions)

---

## ✨ Features

- 🎤 **Real-time Voice Chat** - Talk to Friday naturally
- 🇩🇰 **Danish TTS** - Natural Danish female voice (ElevenLabs)
- 🎯 **Custom Wake Word** - Say "Friday" to activate
- 📱 **Mobile Optimized** - Touch-friendly, safe area support
- 🎨 **Modern UI** - Liquid glass, neon gradients, pulsing orb
- 📝 **Transcript Panel** - See your entire conversation
- ⚙️ **Settings** - Customize voice, wake word, debug mode
- ♿ **Accessible** - Keyboard shortcuts, focus management
- 🔄 **Auto-Restart** - PM2 keeps it running 24/7

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- ElevenLabs API key
- PM2 (optional, for production)

### Installation

```bash
# Clone the repository
git clone https://github.com/JonasAbde/friday-voice-app.git
cd friday-voice-app

# Install dependencies
npm install

# Configure environment
cp .env.example .env
nano .env  # Add your ELEVENLABS_API_KEY

# Start server
node server.js

# Or use PM2 for production
pm2 start server.js --name friday-voice
```

### Access
- **Local:** http://localhost:8765
- **Public:** Expose via Cloudflare Tunnel

---

## 🎯 Usage

### Push-to-Talk Mode
1. Click **Start** button
2. Speak your message
3. Friday responds with voice + text

### Wake Word Mode
1. Toggle **Wake Word** in settings
2. Say **"Friday"** to activate
3. Speak your message
4. Friday responds automatically

### Keyboard Shortcuts
- **Space** - Push-to-Talk (hold)
- **Escape** - Close modals
- **?** - Help overlay (coming soon)

---

## 🏗️ Architecture

### Frontend
- **HTML5** - Semantic structure
- **TailwindCSS** - Modern styling
- **JavaScript** - Voice client, wake word engine

### Backend
- **Node.js** - WebSocket server
- **ElevenLabs API** - Text-to-speech
- **TensorFlow.js** - Wake word detection

### Wake Word Detection
- **Custom Model:** Pattern matching (energy + ZCR)
- **Fallback:** TensorFlow.js speech commands ("go")
- **Training Data:** 77 synthetic "Friday" samples

---

## 📊 Project Stats

- **Version:** v0.1.0 (Alpha)
- **Commits:** 45+
- **Files:** 50+
- **Lines of Code:** ~3,000
- **Wake Word Samples:** 77
- **Features Completed:** 14
- **Known Bugs:** 4 (all low/medium priority)

---

## 🐛 Known Issues

See [BUGS.md](BUGS.md) for full list:

- Cloudflare Tunnel URL changes on restart (workaround: free tier)
- Wake word accuracy ~70% (workaround: PTT mode)
- No VU meters (skipped for v0.1.0)
- No device picker (uses default mic)

---

## 🚀 Roadmap

See [FEATURES.md](FEATURES.md) for full roadmap.

### v0.2.0 (Planned)
- [ ] Conversation history
- [ ] Voice commands
- [ ] Multi-language support
- [ ] Offline mode

### v0.3.0+ (Future)
- [ ] Integration hub (Gmail, Calendar, Slack)
- [ ] Screen sharing
- [ ] Mobile app
- [ ] Browser extension

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Bug Reports
Use [GitHub Issues](https://github.com/JonasAbde/friday-voice-app/issues/new/choose)

---

## 📜 License

MIT License - see [LICENSE](LICENSE) for details

---

## 🙏 Credits

**Built by:** Friday AI (Autonomous agent)  
**Human:** Jonas Abde (Product owner)  
**TTS:** ElevenLabs  
**Inspiration:** Friday from Iron Man  

---

## 📞 Contact

- **GitHub:** [@JonasAbde](https://github.com/JonasAbde)
- **Issues:** [Report a bug](https://github.com/JonasAbde/friday-voice-app/issues/new?template=bug_report.md)
- **Features:** [Request a feature](https://github.com/JonasAbde/friday-voice-app/issues/new?template=feature_request.md)

---

**Made with 🖐️ by Friday AI**
