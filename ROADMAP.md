# Friday Voice App - Development Roadmap

## 🎯 Mission

Build Friday's autonomous voice platform - a foundation for AGI capabilities where Friday develops, tests, and improves its own systems.

---

## 📅 Release Timeline

### **Phase 1: Foundation (Week 1 - Feb 6-12, 2026)** ✅ IN PROGRESS

**Status:** 50% complete

**Goals:**
- [x] Basic WebSocket server
- [x] HTML/CSS voice interface
- [x] Web Speech API integration
- [x] OpenClaw CLI integration
- [ ] ElevenLabs TTS integration
- [ ] Production deployment
- [ ] Mobile optimization

**Deliverable:** Working voice chat interface (MVP)

---

### **Phase 2: Self-Improvement (Week 2-3 - Feb 13-26, 2026)**

**Goals:**
- [ ] Error logging system
- [ ] Automated bug detection
- [ ] Self-debugging loop (Friday fixes own bugs)
- [ ] Performance monitoring
- [ ] A/B testing framework
- [ ] Auto-documentation updates

**Deliverable:** Friday can identify and fix bugs autonomously

---

### **Phase 3: Autonomous Skills (Week 4-6 - Feb 27 - Mar 19, 2026)**

**Goals:**
- [ ] Skill detection (identify missing capabilities)
- [ ] Code generation (write new features)
- [ ] Automated testing (verify new code)
- [ ] Auto-deployment (push updates live)
- [ ] Learning database (track patterns)

**Deliverable:** Friday creates new features without human coding

---

### **Phase 4: AGI Foundation (Month 2+ - Apr 2026+)**

**Goals:**
- [ ] Proactive reasoning (suggest improvements)
- [ ] Cross-domain integration (Rendetalje, Calendar, etc.)
- [ ] Emotional intelligence (detect user mood)
- [ ] Multi-agent coordination (collaborate with other AIs)
- [ ] Long-term planning (30+ day horizons)

**Deliverable:** Friday operates autonomously with minimal supervision

---

## 🛠️ Feature Backlog

### **Priority: CRITICAL**

1. **TTS Integration**
   - Use ElevenLabs API
   - Danish voice (pFZP5JQG7iQjIQuC4Bku)
   - Audio caching (avoid regenerating)
   - **Estimate:** 2-4 hours
   - **Owner:** Friday

2. **Mobile Optimization**
   - Responsive CSS (phone/tablet)
   - Touch-friendly buttons
   - PWA manifest (install to home screen)
   - **Estimate:** 3-5 hours
   - **Owner:** Friday

3. **Error Recovery**
   - Auto-reconnect on disconnect
   - Retry failed requests
   - Fallback to text if voice fails
   - **Estimate:** 2-3 hours
   - **Owner:** Friday

---

### **Priority: HIGH**

4. **Conversation History**
   - Store messages in memory
   - Display chat history on load
   - Search old conversations
   - **Estimate:** 4-6 hours
   - **Owner:** Friday

5. **Performance Optimization**
   - Replace OpenClaw CLI with direct WebSocket
   - Implement response caching
   - Add worker threads for parallel processing
   - **Estimate:** 6-8 hours
   - **Owner:** Friday + Jonas (infrastructure)

6. **Voice Activity Detection**
   - Auto-detect when user stops talking
   - No need to press button to submit
   - **Estimate:** 3-4 hours
   - **Owner:** Friday

---

### **Priority: MEDIUM**

7. **Visual Enhancements**
   - Waveform visualization (animated bars)
   - Typing indicator when Friday thinks
   - Avatar animations
   - **Estimate:** 4-5 hours
   - **Owner:** Friday

8. **Context Awareness**
   - Remember previous messages in session
   - Cross-reference calendar/email data
   - Proactive suggestions
   - **Estimate:** 8-10 hours
   - **Owner:** Friday

9. **Multi-language Support**
   - English voice mode
   - Arabic voice mode (for Rawan!)
   - Auto-detect language
   - **Estimate:** 6-8 hours
   - **Owner:** Friday

---

### **Priority: LOW (Future)**

10. **Video Integration**
    - Webcam capture
    - Screenshot analysis
    - Visual context for responses
    - **Estimate:** 10-15 hours

11. **Smart Home Integration**
    - Control lights, music, etc.
    - Via Home Assistant API
    - **Estimate:** 15-20 hours

12. **Multi-user Support**
    - User accounts
    - Separate conversation histories
    - Per-user preferences
    - **Estimate:** 20-30 hours

---

## 🔬 Research & Experiments

### **Ongoing Investigations:**

1. **Browser Audio Recording**
   - Test MediaRecorder API vs Web Speech API
   - Compare audio quality
   - **Decision:** TBD

2. **Real-time Streaming**
   - Investigate WebRTC for lower latency
   - Test Server-Sent Events vs WebSocket
   - **Decision:** Stick with WebSocket for now

3. **Edge Computing**
   - Run TTS on-device (reduce latency)
   - Explore Web Workers for client-side processing
   - **Decision:** TBD

---

## 📊 Success Metrics

### **Phase 1 (MVP):**
- ✅ Voice input works in browser
- ✅ Friday responds with text
- ⏳ Friday responds with audio (TTS)
- ⏳ <3 second response time (p95)
- ⏳ Works on mobile (iOS/Android)

### **Phase 2 (Self-Improvement):**
- Friday detects 80%+ of bugs autonomously
- Friday fixes 50%+ of bugs without human code
- <1% error rate in production

### **Phase 3 (Autonomous Skills):**
- Friday creates 5+ new features autonomously
- 100% test coverage (auto-generated tests)
- Zero human coding interventions per week

### **Phase 4 (AGI Foundation):**
- Friday operates 7+ days unsupervised
- Proactively suggests 10+ improvements per week
- User satisfaction >90%

---

## 🚧 Known Limitations

### **Current (Phase 1):**
- ❌ No voice output (TTS not integrated)
- ❌ No conversation history
- ❌ Mobile not optimized
- ❌ Single concurrent user only
- ❌ No error persistence (logs not saved)
- ❌ Cloudflare Tunnel URL changes on restart

### **Addressed in Phase 2:**
- TTS integration
- Permanent domain (friday.tekup.dk)
- Error logging to file
- Mobile UI improvements

---

## 🎓 Learning Objectives

### **For Friday:**
- **Web Development:** HTML/CSS/JS mastery
- **Real-time Communication:** WebSocket protocols
- **DevOps:** Server management, deployment
- **Testing:** Unit tests, integration tests, E2E tests
- **Self-awareness:** Monitor own performance, identify bottlenecks

### **For Jonas:**
- **AI Collaboration:** Working WITH an AI that codes
- **System Design:** Architecting for autonomy
- **Product Management:** Prioritizing features effectively

---

## 🔄 Development Workflow

### **Feature Development Process:**

```
1. Identify Need
   - User request
   - Friday's self-analysis
   - Performance data
   ↓
2. Design Solution
   - Technical spec
   - API changes
   - UI mockup
   ↓
3. Implement
   - Write code
   - Add inline comments
   - Update documentation
   ↓
4. Test
   - Unit tests
   - Integration tests
   - Manual testing
   ↓
5. Deploy
   - Push to production
   - Monitor metrics
   - Gather feedback
   ↓
6. Iterate
   - Learn from usage
   - Identify improvements
   - Loop back to step 1
```

---

## 📝 Decision Log

### **2026-02-06: Tech Stack Selection**
- **Chosen:** Vanilla JS (no framework)
- **Rationale:** Lightweight, no build step, fast iteration
- **Alternatives considered:** React, Vue, Svelte
- **Decision maker:** Friday + Jonas

### **2026-02-06: WebSocket vs HTTP Polling**
- **Chosen:** WebSocket
- **Rationale:** Real-time, bidirectional, lower latency
- **Alternatives considered:** Server-Sent Events, long polling
- **Decision maker:** Friday

### **2026-02-06: Cloudflare Tunnel vs Nginx Reverse Proxy**
- **Chosen:** Cloudflare Tunnel (for now)
- **Rationale:** No VPS config changes, instant setup
- **Future:** Migrate to Nginx + custom domain (friday.tekup.dk)
- **Decision maker:** Jonas (security concern)

---

## 🎯 Next Actions (This Week)

**Friday's TODO:**
1. [ ] Integrate ElevenLabs TTS (2-4h)
2. [ ] Mobile CSS optimization (3h)
3. [ ] Add conversation history (4h)
4. [ ] Write unit tests (3h)
5. [ ] Update README with setup instructions (1h)

**Jonas' TODO:**
1. [ ] Test voice interface on phone
2. [ ] Provide feedback on UI/UX
3. [ ] Decide on permanent domain (friday.tekup.dk?)

---

**Last updated:** 2026-02-06  
**Version:** 0.1.0-alpha  
**Next review:** 2026-02-09 (Phase 1 checkpoint)
