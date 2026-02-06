# 🐛 Known Bugs & Issues

**Last Updated:** 2026-02-06

---

## 🔴 High Priority

*None currently*

---

## 🟡 Medium Priority

### #1: Cloudflare Tunnel URL Changes on Restart
**Status:** Known Limitation  
**Impact:** Users need new URL after server restart  
**Workaround:** Use free tier tunnel, URL changes  
**Fix:** Setup named Cloudflare tunnel (requires Jonas' Cloudflare account)  
**Estimated Fix:** 10 min (blocked on Jonas)

### #2: Wake Word Accuracy ~70%
**Status:** Acceptable for v0.1.0  
**Impact:** May require 2-3 attempts to trigger  
**Workaround:** Use Push-to-Talk mode  
**Fix:** Proper ML training (needs Python env setup)  
**Estimated Fix:** 2-3 hours

---

## 🟢 Low Priority

### #3: No VU Meters in UI
**Status:** Skipped (complexity vs value)  
**Impact:** No visual feedback during recording  
**Workaround:** Voice orb animation shows activity  
**Fix:** Implement Web Audio API analyzer  
**Estimated Fix:** 1 hour

### #4: No Device Picker
**Status:** Skipped (uses default mic)  
**Impact:** Can't select specific microphone  
**Workaround:** Change default mic in OS settings  
**Fix:** Add enumerateDevices() dropdown  
**Estimated Fix:** 30 min

---

## 📊 Bug Metrics

- **Total Bugs:** 4
- **High:** 0
- **Medium:** 2
- **Low:** 2
- **Fixed:** 0 (v0.1.0 just launched)

---

## 🔧 Reporting Bugs

Use GitHub Issues: https://github.com/JonasAbde/friday-voice-app/issues/new/choose
