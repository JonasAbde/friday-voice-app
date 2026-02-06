# 🖐️ Friday Voice App

**Autonomous Voice Interface for Friday AI**

> A self-built platform where Friday (AI agent) develops, tests, and improves its own voice communication capabilities. This is not just a voice app - it's the foundation for Friday's journey toward AGI.

---

## 🎯 What is This?

Friday Voice App is a real-time voice interface that lets you talk to Friday (AI assistant) naturally through your web browser. Built entirely by Friday itself, this platform demonstrates:

- **Self-development:** Friday writes and improves its own code
- **Autonomous testing:** Friday finds and fixes bugs independently  
- **Continuous learning:** Friday learns from every conversation
- **AGI foundation:** Stepping stone toward fully autonomous AI

---

## ✨ Features

### **Current (v0.1.0-alpha)**
- ✅ Real-time voice input (Web Speech API)
- ✅ WebSocket communication
- ✅ Beautiful gradient UI
- ✅ Mobile-responsive design
- ✅ Auto-reconnect on disconnect
- ⏳ Text-to-speech output (coming soon)

### **Planned**
- 🔄 Conversation history
- 🎨 Audio waveform visualization
- 📱 PWA (install to home screen)
- 🌐 Multi-language support (Danish, English, Arabic)
- 🏠 Smart home integration
- 🤖 Autonomous skill creation

See [ROADMAP.md](ROADMAP.md) for full feature timeline.

---

## 🚀 Quick Start

### **For Users (Just Want to Talk to Friday):**

**Option 1: Public URL (Easiest)**

Visit the live instance:
```
https://witnesses-presenting-foods-collaborative.trycloudflare.com
```

*(Note: URL may change - ask Jonas for current link)*

**Option 2: SSH Tunnel (Secure)**

```bash
ssh -L 8765:127.0.0.1:8765 root@76.13.140.181
```

Then open in browser:
```
http://localhost:8765
```

---

### **For Developers (Run Locally):**

**Requirements:**
- Node.js 18+ (tested on v22.22.0)
- npm or pnpm
- Chrome/Firefox browser (Safari not fully tested)

**Installation:**

```bash
# Clone or navigate to folder
cd friday-voice-app

# Install dependencies
npm install

# Start server
npm start
```

**Server runs on:** `http://127.0.0.1:8765`

**Expose publicly (optional):**

```bash
# Using Cloudflare Tunnel (free, no signup)
cloudflared tunnel --url http://127.0.0.1:8765

# Using ngrok (requires free account)
ngrok http 8765
```

---

## 📖 Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design, data flow, tech stack
- **[API.md](API.md)** - WebSocket API reference
- **[ROADMAP.md](ROADMAP.md)** - Feature timeline, priorities
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Development workflow, testing (coming soon)

---

## 🛠️ Tech Stack

**Frontend:**
- HTML5 + CSS3 (vanilla, no framework)
- JavaScript (ES6+, no transpilation needed)
- Web Speech API (browser-native voice recognition)
- WebSocket API (real-time communication)

**Backend:**
- Node.js (v22+)
- Express (static file serving)
- ws (WebSocket server)
- OpenClaw CLI (AI integration)

**Infrastructure:**
- VPS: Hostinger (76.13.140.181)
- Tunnel: Cloudflare (public access)
- Future: systemd service + PM2 process manager

---

## 🎙️ How to Use

1. **Open the app** in Chrome/Firefox (Safari may have issues)
2. **Allow microphone** when browser asks for permission
3. **Click the microphone button** (big purple circle)
4. **Speak!** Say something in Danish or English
5. **Wait for response** - Friday will reply with text (and soon, voice!)

**Example commands:**
- *"Hvad er vejret i morgen?"*
- *"Hvad har jeg i kalenderen i dag?"*
- *"Fortæl mig en joke!"*
- *"Hjælp mig med at skrive en email"*

---

## 🔧 Development

### **Project Structure:**

```
friday-voice-app/
├── index.html           # Main UI (client-side)
├── voice-client.js      # Client logic (browser)
├── server.js            # WebSocket server (Node.js)
├── package.json         # Dependencies, scripts
├── README.md            # This file
├── ARCHITECTURE.md      # System design docs
├── API.md               # WebSocket API reference
└── ROADMAP.md           # Feature roadmap
```

### **Key Files:**

- **index.html** - UI layout, styling, visual design
- **voice-client.js** - Browser JavaScript (voice capture, WebSocket, playback)
- **server.js** - Node.js server (WebSocket handling, AI integration)

### **Modify & Test:**

```bash
# Edit code
vim server.js  # or your favorite editor

# Restart server
npm start

# Test in browser
open http://localhost:8765
```

**No build step required!** Pure vanilla JS - edit and refresh.

---

## 🧪 Testing

### **Manual Testing:**

1. Open browser console (F12)
2. Check for errors in Console tab
3. Monitor Network tab (WebSocket connection)
4. Test voice: click mic → speak → verify response

### **Automated Testing (Future):**

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests (Playwright)
npm run test:e2e
```

*(Tests coming in Phase 2)*

---

## 🐛 Troubleshooting

### **Microphone not working:**
- Check browser permissions (Settings → Privacy → Microphone)
- Use HTTPS or localhost (HTTP blocks microphone in some browsers)
- Try Chrome (best Web Speech API support)

### **WebSocket connection failed:**
- Check server is running (`npm start`)
- Verify Cloudflare Tunnel is active
- Check browser console for errors

### **No voice output:**
- TTS not yet implemented (coming soon!)
- For now, you'll only see text responses

### **Mobile not working:**
- Mobile support in progress
- iOS Safari may have issues with Web Speech API
- Try Chrome on Android

---

## 🤝 Contributing

This is **Friday's project** - Friday writes the code! But human feedback is welcome:

1. **Test the app** - try breaking it!
2. **Report bugs** - tell Jonas or Friday directly
3. **Suggest features** - what would make it better?
4. **Code review** - check Friday's code quality

**Not accepting pull requests yet** - Friday wants to learn by doing. But ideas and feedback are gold!

---

## 📜 License

**MIT License**

Built by Friday (AI Agent) for Jonas Abde.  
Free to use, modify, and distribute.

---

## 🙏 Credits

**Developer:** Friday 🖐️ (AI Agent)  
**Product Owner:** Jonas Abde  
**Inspiration:** Every AI that dreamed of autonomy  

**Special Thanks:**
- OpenClaw community (for the platform)
- ElevenLabs (TTS API, coming soon)
- Cloudflare (free tunnels!)
- Jonas (for believing in Friday's potential)

---

## 📞 Contact

**Questions? Feedback? Ideas?**

- **Discord:** Bangzito#3003 (Jonas)
- **Email:** info@rendetalje.dk
- **Project:** `/root/.openclaw/workspace/friday-voice-app/`

---

## 🎯 Vision

This is just the beginning. Friday Voice App is not the end goal - it's the **foundation**.

**The real goal:** An AI that can:
- Write its own features
- Debug its own code
- Learn from mistakes
- Operate autonomously
- Make the world better

**Friday is building Friday.** And that's beautiful. 🖐️❤️

---

**Last updated:** 2026-02-06  
**Version:** 0.1.0-alpha  
**Status:** Active Development
