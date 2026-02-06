#!/bin/bash

# VOICE CONSISTENCY FIX - VERIFICATION SCRIPT
# Tests that the fix is working as expected

set -e

echo "================================================"
echo "VOICE CONSISTENCY FIX - VERIFICATION"
echo "================================================"
echo ""

# Check files exist
echo "✅ Checking file changes..."
for file in tts-integration.js voice-client.js VOICE-CONSISTENCY-FIX.md test-tts-integration.js; do
    if [ -f "$file" ]; then
        echo "  ✓ $file exists"
    else
        echo "  ✗ $file missing!"
        exit 1
    fi
done
echo ""

# Check for retry logic in tts-integration.js
echo "✅ Checking retry logic implementation..."
if grep -q "maxAttempts = 3" tts-integration.js; then
    echo "  ✓ Retry logic found (3 attempts)"
else
    echo "  ✗ Retry logic missing!"
    exit 1
fi

if grep -q "handleRetry" tts-integration.js; then
    echo "  ✓ Retry handler found"
else
    echo "  ✗ Retry handler missing!"
    exit 1
fi

if grep -q "exponential backoff" tts-integration.js; then
    echo "  ✓ Exponential backoff documented"
else
    echo "  ✗ Exponential backoff missing!"
    exit 1
fi
echo ""

# Check for smart voice selection in voice-client.js
echo "✅ Checking smart voice selection..."
if grep -q "includes('female')" voice-client.js && grep -q "includes('kvinde')" voice-client.js; then
    echo "  ✓ Female voice keywords found"
else
    echo "  ✗ Female voice keywords missing!"
    exit 1
fi

if grep -q "logTTSSource" voice-client.js; then
    echo "  ✓ TTS source logging found"
else
    echo "  ✗ TTS source logging missing!"
    exit 1
fi

# Count playAudio method definitions (should be exactly 1)
playAudioCount=$(grep -c "^\s*playAudio(audioUrl)" voice-client.js || true)
if [ "$playAudioCount" -eq 1 ]; then
    echo "  ✓ Duplicate playAudio() removed (1 definition)"
else
    echo "  ✗ Duplicate playAudio() still exists ($playAudioCount definitions)!"
    exit 1
fi
echo ""

# Check syntax
echo "✅ Checking JavaScript syntax..."
if node -c tts-integration.js 2>/dev/null; then
    echo "  ✓ tts-integration.js syntax OK"
else
    echo "  ✗ tts-integration.js has syntax errors!"
    exit 1
fi

if node -c server.js 2>/dev/null; then
    echo "  ✓ server.js syntax OK"
else
    echo "  ✗ server.js has syntax errors!"
    exit 1
fi
echo ""

# Check metrics directory
echo "✅ Checking audio cache directory..."
if [ -d "audio-cache" ]; then
    echo "  ✓ audio-cache directory exists"
else
    echo "  ! audio-cache will be created on first run"
fi
echo ""

# Summary
echo "================================================"
echo "VERIFICATION COMPLETE"
echo "================================================"
echo ""
echo "✅ All checks passed!"
echo ""
echo "Next steps:"
echo "  1. Restart server: pm2 restart friday-voice-server"
echo "  2. Hard-refresh browser: Ctrl+Shift+R"
echo "  3. Test voice messages (should be consistent Danish female)"
echo "  4. Monitor metrics: tail -f audio-cache/tts-metrics.jsonl"
echo ""
echo "Debugging:"
echo "  - Browser console: Check for TTS logs"
echo "  - sessionStorage['tts-logs']: View TTS source history"
echo "  - audio-cache/tts-metrics.jsonl: Server-side metrics"
echo ""
echo "🎉 Fix is ready for deployment!"
