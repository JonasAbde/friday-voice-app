# Friday Voice App - Architecture Documentation

## 🎯 Project Vision

**Goal:** Build Friday's autonomous voice platform - a foundation for AGI capabilities.

**Philosophy:**
- Self-built by Friday (AI agent)
- Self-improving (learns from usage)
- Self-debugging (finds and fixes own bugs)
- Production-grade quality

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  index.html - UI Layer                               │   │
│  │  - Visual interface (gradient design)                │   │
│  │  - Microphone button                                 │   │
│  │  - Chat history display                              │   │
│  │  - Audio visualizer                                  │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  voice-client.js - Client Logic                      │   │
│  │  - Web Speech API (voice capture)                    │   │
│  │  - WebSocket connection                              │   │
│  │  - Audio playback                                    │   │
│  │  - UI state management                               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ WebSocket (wss://)
┌─────────────────────────────────────────────────────────────┐
│                    SERVER (VPS)                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  server.js - WebSocket Server                        │   │
│  │  - Express static file serving                       │   │
│  │  - WebSocket connection handler                      │   │
│  │  - Message routing                                   │   │
│  │  - Client connection management                      │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  AI Integration Layer                                │   │
│  │  - OpenClaw CLI integration                          │   │
│  │  - Friday AI session communication                   │   │
│  │  - Context management                                │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  TTS Integration (Future)                            │   │
│  │  - ElevenLabs API                                    │   │
│  │  - Audio file generation                             │   │
│  │  - Caching system                                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTPS
┌─────────────────────────────────────────────────────────────┐
│              CLOUDFLARE TUNNEL (Public Access)               │
│  - TLS termination                                           │
│  - DDoS protection                                           │
│  - Global CDN                                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### **Voice Input Flow:**

```
1. User clicks microphone button
   ↓
2. Browser requests microphone permission
   ↓
3. Web Speech API captures audio → transcribes to text
   ↓
4. voice-client.js sends WebSocket message:
   {
     type: 'voice_message',
     transcript: 'Hvad er vejret i morgen?',
     timestamp: 1234567890
   }
   ↓
5. server.js receives message
   ↓
6. Calls OpenClaw CLI: openclaw chat --agent main --message "..."
   ↓
7. Friday AI processes request
   ↓
8. Response returned to server.js
   ↓
9. (Future) TTS converts text → audio
   ↓
10. Server sends WebSocket response:
    {
      type: 'friday_response',
      text: 'I morgen bliver det...',
      audioUrl: '/audio/response-123.mp3'
    }
   ↓
11. voice-client.js displays text + plays audio
   ↓
12. User hears Friday's voice!
```

---

## 🛠️ Technology Stack

### **Frontend:**
- **HTML5** - Semantic markup, accessibility
- **CSS3** - Gradient UI, animations, responsive design
- **Vanilla JavaScript** - No framework dependencies (lightweight)
- **Web Speech API** - Browser-native voice recognition
- **WebSocket API** - Real-time bidirectional communication

### **Backend:**
- **Node.js** (v22+) - Runtime environment
- **Express** (^4.18) - Static file serving, HTTP server
- **ws** (^8.14) - WebSocket server implementation
- **OpenClaw CLI** - AI agent communication

### **Infrastructure:**
- **VPS Hosting** - Hostinger (76.13.140.181)
- **Cloudflare Tunnel** - Secure public access (no port forwarding)
- **systemd** - Process management (future: auto-restart)

---

## 📁 File Structure

```
friday-voice-app/
├── README.md               # Project overview, quick start
├── ARCHITECTURE.md         # This file - system design
├── DEVELOPMENT.md          # Development workflow, testing
├── DEPLOYMENT.md           # Production deployment guide
├── API.md                  # WebSocket API documentation
├── ROADMAP.md              # Future features, milestones
│
├── package.json            # Dependencies, scripts
├── package-lock.json       # Locked dependency versions
│
├── index.html              # Main UI (client-side)
├── voice-client.js         # Client logic (browser)
├── server.js               # WebSocket server (Node.js)
│
├── docs/                   # Additional documentation
│   ├── CONTRIBUTING.md     # How to contribute
│   ├── TESTING.md          # Testing strategy
│   └── SECURITY.md         # Security considerations
│
├── scripts/                # Utility scripts
│   ├── start-tunnel.sh     # Launch Cloudflare Tunnel
│   ├── deploy.sh           # Deployment automation
│   └── test.sh             # Run tests
│
├── tests/                  # Test suite
│   ├── client.test.js      # Client-side tests
│   └── server.test.js      # Server-side tests
│
└── logs/                   # Application logs (gitignored)
    ├── server.log
    └── error.log
```

---

## 🔐 Security Considerations

### **Current:**
- ✅ HTTPS via Cloudflare Tunnel (TLS 1.3)
- ✅ WebSocket over TLS (wss://)
- ✅ No authentication (single-user MVP)

### **Future (Production):**
- [ ] User authentication (JWT tokens)
- [ ] Rate limiting (prevent abuse)
- [ ] Input validation (sanitize transcripts)
- [ ] CORS policy (restrict origins)
- [ ] Audit logging (track all requests)

---

## 📊 Performance Considerations

### **Current Bottlenecks:**
1. **OpenClaw CLI spawn** - Each request spawns new process (~200-500ms overhead)
2. **No caching** - Identical requests processed every time
3. **Single-threaded** - No concurrent request handling

### **Optimization Roadmap:**
1. **WebSocket connection to OpenClaw** (eliminate CLI spawn)
2. **Response caching** (LRU cache for common queries)
3. **Worker threads** (parallel processing)
4. **Audio pre-generation** (TTS cache)

---

## 🧪 Testing Strategy

### **Unit Tests:**
- Client-side message parsing
- Server-side WebSocket handling
- Error handling edge cases

### **Integration Tests:**
- End-to-end voice flow
- WebSocket connection stability
- OpenClaw CLI integration

### **Manual Testing:**
- Browser compatibility (Chrome, Firefox, Safari, Edge)
- Mobile responsiveness (iOS Safari, Android Chrome)
- Network resilience (disconnect/reconnect)

---

## 📈 Monitoring & Observability

### **Metrics to Track:**
- Request count (total, per hour)
- Response time (p50, p95, p99)
- Error rate (% failed requests)
- Active WebSocket connections
- TTS API usage (future)

### **Logging:**
- Structured JSON logs
- Error stack traces
- User interaction events
- Performance timings

---

## 🚀 Deployment

### **Current (Development):**
```bash
# Start server
npm start

# Expose via Cloudflare Tunnel
cloudflared tunnel --url http://127.0.0.1:8765
```

### **Future (Production):**
```bash
# systemd service
systemctl start friday-voice-server

# PM2 process manager
pm2 start server.js --name friday-voice

# Permanent Cloudflare Tunnel
cloudflared tunnel route dns friday friday.tekup.dk
```

---

## 🔄 Development Workflow

1. **Feature planning** - Document in ROADMAP.md
2. **Implementation** - Write code + inline comments
3. **Testing** - Unit + integration tests
4. **Documentation** - Update relevant .md files
5. **Deploy** - Restart server, verify
6. **Monitor** - Check logs, metrics
7. **Iterate** - Learn, improve, repeat

---

## 🎯 Next Steps

See **ROADMAP.md** for detailed feature timeline.

---

**Last updated:** 2026-02-06  
**Version:** 0.1.0-alpha  
**Maintainer:** Friday (AI Agent)
