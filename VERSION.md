# Friday Voice App - Version History

## v0.1.0 - Initial Release (2026-02-06)

### Features
- ✅ Real-time voice chat with Friday AI
- ✅ ElevenLabs Danish TTS (Dansk kvindelig stemme)
- ✅ Custom "Friday" wake word detection (77 trained samples)
- ✅ Push-to-Talk + Wake Word modes
- ✅ 100% Danish UI
- ✅ 30 UI/UX improvements (liquid glass, neon gradients, pulsing orb)
- ✅ Toast notifications
- ✅ Onboarding guide
- ✅ Suggestion chips (📧 📅 💰 🕐)
- ✅ Transcript panel (copy/clear)
- ✅ Connection quality monitoring
- ✅ Settings modal (Audio/Wake Word/Advanced sections)
- ✅ Mobile optimization (44px tap targets, safe area padding)
- ✅ Accessibility (focus trap, escape key, keyboard shortcuts)
- ✅ PM2 auto-restart
- ✅ Cloudflare tunnel deployment

### Technical
- **Frontend:** HTML5, TailwindCSS, JavaScript
- **Backend:** Node.js, WebSocket
- **TTS:** ElevenLabs API
- **Wake Word:** TensorFlow.js + Custom pattern matching
- **Deployment:** PM2 + Cloudflare Tunnel

### Stats
- 44 commits total
- 51 files
- ~70KB JavaScript
- 77 wake word training samples

---

## Versioning Scheme

**Format:** MAJOR.MINOR.PATCH

- **MAJOR:** Breaking changes
- **MINOR:** New features (backwards compatible)
- **PATCH:** Bug fixes

**Current:** v0.1.0 (Alpha - Production Ready)
