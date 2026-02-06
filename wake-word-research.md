# Wake Word Detection Research

## Goal
Implement "Friday" wake word detection for always-on voice activation

## Requirements
- Offline processing (privacy + no API costs)
- Low CPU usage (<5% idle)
- Browser-compatible (no native install)
- High accuracy (>95%)
- Low latency (<500ms)

## Options Research

### Option 1: Porcupine (Picovoice)
**Pros:**
- Industry standard
- Browser SDK available (WebAssembly)
- Custom wake words supported
- Optimized for low power
- Free tier available

**Cons:**
- Requires API key
- Custom wake word = paid tier ($0.25/month per device)
- Proprietary

**Verdict:** Best option if we pay, but need to check free tier limits

### Option 2: Snowboy (Deprecated)
**Status:** Project discontinued (2020)
**Verdict:** Don't use

### Option 3: TensorFlow.js + Speech Commands
**Pros:**
- Fully open source
- Runs in browser
- Can train custom models

**Cons:**
- Higher CPU usage
- Need to train model ourselves
- Lower accuracy than Porcupine

**Verdict:** Fallback option if Porcupine doesn't work

### Option 4: Web Speech API (browser native)
**Pros:**
- Built into browser
- Zero config
- Already using it for transcription

**Cons:**
- NOT designed for wake word detection
- Continuous recognition = high CPU
- Privacy concerns (Google servers)
- No offline mode

**Verdict:** Not suitable for always-on listening

### Option 5: Precise (Mycroft AI)
**Pros:**
- Open source
- Privacy-focused
- Custom wake words

**Cons:**
- Requires Python server
- More complex setup
- Not browser-native

**Verdict:** Could work but more complex than needed

## Decision: Start with Porcupine

**Why:**
1. Best accuracy/performance ratio
2. Browser WebAssembly SDK
3. Industry proven
4. Can train custom "Friday" wake word
5. Fallback to TensorFlow.js if cost becomes issue

**Next steps:**
1. Check Porcupine free tier limits
2. Test browser SDK
3. Train custom "Friday" wake word
4. Integrate into voice client
5. Measure CPU/latency

**Alternative plan:**
If Porcupine free tier insufficient → build TensorFlow.js model using Google Speech Commands dataset

---

**Research time:** 8 minutes
**Decision confidence:** 85%
