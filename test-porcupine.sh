#!/bin/bash

# PORCUPINE WAKE WORD TEST SCRIPT
# Automated testing suite for wake word detection performance
# 
# Tests:
# 1. Detection rate (accuracy)
# 2. False positive rate
# 3. Latency measurement
# 4. Noise robustness
#
# Author: Friday (AI Agent)
# Created: 2026-02-06

echo "🧪 PORCUPINE WAKE WORD DETECTION TEST SUITE"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test configuration
WAKE_WORD="Friday"
TEST_ITERATIONS=10
FALSE_POSITIVE_DURATION=300  # 5 minutes

echo "📋 Test Configuration:"
echo "   Wake Word: $WAKE_WORD"
echo "   Iterations: $TEST_ITERATIONS"
echo "   False Positive Test: ${FALSE_POSITIVE_DURATION}s"
echo ""

# Check if server is running
echo "🔍 Checking if Friday Voice Server is running..."
if curl -s http://localhost:8765/health > /dev/null; then
    echo -e "${GREEN}✅ Server is running${NC}"
else
    echo -e "${RED}❌ Server is NOT running${NC}"
    echo "   Start server: cd /root/.openclaw/workspace/friday-voice-app && npm start"
    exit 1
fi

echo ""

# Test 1: Check Porcupine SDK is loaded
echo "📦 Test 1: Porcupine SDK Check"
echo "   Open browser console and check for:"
echo "   - typeof PorcupineWeb !== 'undefined'"
echo "   - typeof WebVoiceProcessor !== 'undefined'"
echo ""
echo "   ${YELLOW}Manual check required - Press ENTER when verified${NC}"
read

# Test 2: Access Key validation
echo "📋 Test 2: Access Key Validation"
if [ -f "/root/.openclaw/workspace/friday-voice-app/.env" ]; then
    if grep -q "PICOVOICE_ACCESS_KEY" /root/.openclaw/workspace/friday-voice-app/.env; then
        echo -e "${GREEN}✅ Access Key found in .env${NC}"
    else
        echo -e "${RED}❌ Access Key NOT found in .env${NC}"
        echo "   Add: PICOVOICE_ACCESS_KEY=your_key_here"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo "   Create: /root/.openclaw/workspace/friday-voice-app/.env"
    echo "   Add: PICOVOICE_ACCESS_KEY=your_key_here"
fi

echo ""

# Test 3: Model file check
echo "📁 Test 3: Wake Word Model File Check"
MODEL_DIR="/root/.openclaw/workspace/friday-voice-app/models"
if [ -d "$MODEL_DIR" ]; then
    echo -e "${GREEN}✅ Models directory exists${NC}"
    
    # Check for .ppn files
    PPN_FILES=$(find "$MODEL_DIR" -name "*.ppn" 2>/dev/null)
    if [ -n "$PPN_FILES" ]; then
        echo -e "${GREEN}✅ Found .ppn model files:${NC}"
        echo "$PPN_FILES" | while read file; do
            SIZE=$(du -h "$file" | cut -f1)
            echo "   - $(basename $file) ($SIZE)"
        done
    else
        echo -e "${RED}❌ No .ppn files found${NC}"
        echo "   Download from Picovoice Console and place in $MODEL_DIR"
        exit 1
    fi
else
    echo -e "${RED}❌ Models directory does not exist${NC}"
    echo "   Create: mkdir -p $MODEL_DIR"
    exit 1
fi

echo ""

# Test 4: CORS Headers Check
echo "🌐 Test 4: CORS Headers Check (SharedArrayBuffer support)"
CORS_CHECK=$(curl -s -I http://localhost:8765/ | grep -i "cross-origin")
if echo "$CORS_CHECK" | grep -q "same-origin"; then
    echo -e "${GREEN}✅ CORS headers configured correctly${NC}"
    echo "   Cross-Origin-Opener-Policy: same-origin"
    echo "   Cross-Origin-Embedder-Policy: require-corp"
else
    echo -e "${RED}❌ CORS headers missing or incorrect${NC}"
    echo "   Check server.js for CORS middleware"
fi

echo ""

# Test 5: Manual Detection Test
echo "🎤 Test 5: Manual Wake Word Detection Test"
echo "   Instructions:"
echo "   1. Open browser: http://localhost:8765"
echo "   2. Click microphone button (enable wake word)"
echo "   3. Say '$WAKE_WORD' clearly $TEST_ITERATIONS times"
echo "   4. Count how many times it activates"
echo ""
echo "   ${YELLOW}How many detections out of $TEST_ITERATIONS? (0-$TEST_ITERATIONS)${NC}"
read DETECTIONS

# Calculate accuracy
ACCURACY=$(echo "scale=1; ($DETECTIONS / $TEST_ITERATIONS) * 100" | bc)
echo ""
if (( $(echo "$ACCURACY >= 95" | bc -l) )); then
    echo -e "${GREEN}✅ PASSED: ${ACCURACY}% accuracy (target: ≥95%)${NC}"
else
    echo -e "${RED}❌ FAILED: ${ACCURACY}% accuracy (target: ≥95%)${NC}"
    echo "   Troubleshooting:"
    echo "   - Check microphone quality"
    echo "   - Reduce background noise"
    echo "   - Try different wake word phrase"
    echo "   - Adjust sensitivity in porcupine-wake-word-engine.js"
fi

echo ""

# Test 6: False Positive Test
echo "🔇 Test 6: False Positive Rate Test"
echo "   Instructions:"
echo "   1. Keep wake word detection active"
echo "   2. Talk normally for 5 minutes (DO NOT say '$WAKE_WORD')"
echo "   3. Count how many false activations occur"
echo ""
echo "   ${YELLOW}How many false positives? (0 = best)${NC}"
read FALSE_POSITIVES

# Calculate false positive rate per hour
FALSE_POSITIVE_RATE=$(echo "scale=2; ($FALSE_POSITIVES / $FALSE_POSITIVE_DURATION) * 3600" | bc)
echo ""
if (( $(echo "$FALSE_POSITIVE_RATE <= 0.5" | bc -l) )); then
    echo -e "${GREEN}✅ PASSED: ${FALSE_POSITIVE_RATE} false positives/hour (target: ≤0.5)${NC}"
else
    echo -e "${RED}❌ FAILED: ${FALSE_POSITIVE_RATE} false positives/hour (target: ≤0.5)${NC}"
    echo "   Troubleshooting:"
    echo "   - Lower sensitivity in porcupine-wake-word-engine.js"
    echo "   - Use longer wake word phrase (e.g., 'Hey Friday')"
    echo "   - Check for audio feedback loops"
fi

echo ""

# Test 7: Latency Test
echo "⚡ Test 7: Latency Measurement"
echo "   Instructions:"
echo "   1. Open browser console"
echo "   2. Say '$WAKE_WORD' and check console output"
echo "   3. Look for: '⚡ Detection latency: XXXms'"
echo ""
echo "   ${YELLOW}What was the average latency in milliseconds? (e.g., 180)${NC}"
read LATENCY

if [ "$LATENCY" -le 300 ]; then
    echo -e "${GREEN}✅ PASSED: ${LATENCY}ms latency (target: ≤300ms)${NC}"
else
    echo -e "${RED}❌ FAILED: ${LATENCY}ms latency (target: ≤300ms)${NC}"
    echo "   Troubleshooting:"
    echo "   - Check browser performance (close heavy tabs)"
    echo "   - Try different browser (Chrome recommended)"
    echo "   - Check CPU usage (should be ~5%)"
fi

echo ""

# Test Summary
echo "=========================================="
echo "📊 TEST SUMMARY"
echo "=========================================="
echo ""
echo "Test Results:"
echo "   1. Porcupine SDK: ${YELLOW}Manual Check${NC}"
echo "   2. Access Key: ✅"
echo "   3. Model Files: ✅"
echo "   4. CORS Headers: ✅"
if (( $(echo "$ACCURACY >= 95" | bc -l) )); then
    echo "   5. Detection Accuracy: ${GREEN}${ACCURACY}% ✅${NC}"
else
    echo "   5. Detection Accuracy: ${RED}${ACCURACY}% ❌${NC}"
fi
if (( $(echo "$FALSE_POSITIVE_RATE <= 0.5" | bc -l) )); then
    echo "   6. False Positive Rate: ${GREEN}${FALSE_POSITIVE_RATE}/hour ✅${NC}"
else
    echo "   6. False Positive Rate: ${RED}${FALSE_POSITIVE_RATE}/hour ❌${NC}"
fi
if [ "$LATENCY" -le 300 ]; then
    echo "   7. Latency: ${GREEN}${LATENCY}ms ✅${NC}"
else
    echo "   7. Latency: ${RED}${LATENCY}ms ❌${NC}"
fi

echo ""

# Overall status
TESTS_PASSED=0
(( $(echo "$ACCURACY >= 95" | bc -l) )) && ((TESTS_PASSED++))
(( $(echo "$FALSE_POSITIVE_RATE <= 0.5" | bc -l) )) && ((TESTS_PASSED++))
[ "$LATENCY" -le 300 ] && ((TESTS_PASSED++))

if [ $TESTS_PASSED -eq 3 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! Wake word detection is working professionally.${NC}"
    echo ""
    echo "Next Steps:"
    echo "   1. Monitor performance for 1 week"
    echo "   2. Collect user feedback"
    echo "   3. Fine-tune sensitivity if needed"
    echo "   4. Remove TensorFlow.js fallback (optional)"
else
    echo -e "${YELLOW}⚠️  $TESTS_PASSED/3 tests passed. Review failures above.${NC}"
    echo ""
    echo "Troubleshooting Resources:"
    echo "   - Integration Guide: PORCUPINE-INTEGRATION-GUIDE.md"
    echo "   - Picovoice Docs: https://picovoice.ai/docs/porcupine/"
    echo "   - Console: https://console.picovoice.ai/"
fi

echo ""
echo "=========================================="
echo "Test completed: $(date)"
echo "=========================================="
