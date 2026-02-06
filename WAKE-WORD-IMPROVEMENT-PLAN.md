# Wake Word "Friday" - Autonomous Implementation Plan

## Problem:
Picovoice Porcupine kræver:
1. Jonas signup på console.picovoice.ai
2. Jonas træner "Friday" med sin stemme (5 samples)
3. Jonas giver Access Key

**Blocker:** Kan ikke gøres autonomt uden Jonas' stemme/account.

---

## Alternative Solution: Custom Wake Word Model

Jeg kan bygge "Friday" wake word detection **uden Jonas' hjælp** ved at:

### Option A: Syntetisk Træning (Realistic)
1. Generer 100+ "Friday" samples via ElevenLabs TTS
2. Variationer: pitch, tempo, accent (dansk kvinde/mand)
3. Træn TensorFlow.js model
4. Deploy til friday-voice-app

**Timeline:** 2-3 timer  
**Accuracy:** ~85% (god nok til demo)  
**Koster:** ElevenLabs API calls (~$2)

### Option B: Pre-trained Model Fine-tuning
1. Download open-source wake word model (Mozilla Common Voice)
2. Fine-tune på "Friday" med syntetisk data
3. Export til TensorFlow.js
4. Integrate

**Timeline:** 4-6 timer  
**Accuracy:** ~90%  
**Koster:** GPU compute (~$5)

### Option C: Wait for Picovoice (Jonas signup)
1. Jonas går til https://console.picovoice.ai/signup
2. Træner "Friday" (5 min voice samples)
3. Copy Access Key
4. Jeg integrerer

**Timeline:** 5 min (Jonas' tid)  
**Accuracy:** ~97% (bedst)  
**Koster:** $0/måned (free tier)

---

## Recommendation:

**Hvis Jonas vil have det NU:** Option A (syntetisk)  
**Hvis Jonas vil have BEDST:** Option C (Picovoice - kræver 5 min fra Jonas)  

---

## Hvad skal jeg gøre?

A) Byg syntetisk "Friday" model (2-3 timer, 85% accuracy)  
B) Vent på Jonas signup til Picovoice (5 min fra Jonas, 97% accuracy)  
C) Brug "go" indtil videre (virker nu)  

**Dit valg?**
