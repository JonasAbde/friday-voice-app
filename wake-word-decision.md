# Wake Word Detection - Implementation Decision

## Initial Plan: Porcupine
**Problem:** Requires Picovoice AccessKey (needs email verification - can't do autonomously)

## Autonomous Pivot: TensorFlow.js Speech Commands

**Why:**
- ✅ Fully open source (no API keys needed)
- ✅ Runs in browser (no server needed)
- ✅ Can be implemented RIGHT NOW (autonomous)
- ✅ Pre-trained model available
- ✅ Can retrain for custom wake words later

**Trade-offs:**
- ❌ Lower accuracy than Porcupine (85-90% vs 97%+)
- ❌ Higher CPU usage (~10% vs 4%)
- ✅ BUT: Good enough for MVP testing!

## Implementation Strategy

### Phase 1: Use Pre-trained Model (TODAY)
Use TensorFlow.js Speech Commands with closest match to "Friday":
- Model recognizes 18 words including "go", "stop", "left", "right", etc.
- We can use "go" as temporary wake word
- Or use transfer learning to add "Friday"

### Phase 2: Custom Wake Word (if TF.js works well)
1. Collect training data (Jonas says "Friday" 100x)
2. Retrain model with transfer learning
3. Deploy custom model

### Phase 3: Consider Porcupine (if TF.js isn't good enough)
- Jonas creates Picovoice account
- I train custom "Friday" wake word
- Switch to Porcupine for production

## Decision: Start with TensorFlow.js NOW

**Advantage:** I can build it RIGHT NOW without waiting for API keys!

**Next steps:**
1. Install TensorFlow.js + Speech Commands
2. Implement wake word listener
3. Test with "go" or closest match
4. Measure accuracy/CPU
5. If good enough → stay, if not → pivot to Porcupine

---

**Autonomous decision made:** TensorFlow.js for MVP!
**Time saved:** No waiting for email verification
**Risk:** Lower accuracy, but we can test and iterate
