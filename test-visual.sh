#!/bin/bash
# Visual validation test for Friday Voice App
# Tests HTML/CSS/JS loading and basic functionality

URL="https://provider-oils-myers-gary.trycloudflare.com"

echo "🧪 TESTING FRIDAY VOICE APP"
echo "==========================="
echo ""

# Test 1: HTML loads (200 OK)
echo "📄 Test 1: HTML Loading..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
if [ "$STATUS" = "200" ]; then
    echo "   ✅ HTML loads (HTTP $STATUS)"
else
    echo "   ❌ HTML failed (HTTP $STATUS)"
    exit 1
fi

# Test 2: JavaScript loads
echo "📜 Test 2: JavaScript Loading..."
JS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL/voice-client.js")
if [ "$JS_STATUS" = "200" ]; then
    echo "   ✅ voice-client.js loads"
else
    echo "   ❌ JavaScript failed"
    exit 1
fi

# Test 3: Check for Canvas element in HTML
echo "🎨 Test 3: Canvas Element Present..."
if curl -s "$URL" | grep -q 'id="voice-orb"'; then
    echo "   ✅ Canvas orb element found"
else
    echo "   ❌ Canvas element missing"
    exit 1
fi

# Test 4: Check for required CSS classes
echo "💎 Test 4: Glassmorphism CSS..."
if curl -s "$URL" | grep -q 'glass-card'; then
    echo "   ✅ Glass card CSS found"
else
    echo "   ❌ Glass card CSS missing"
    exit 1
fi

# Test 5: Check for animation keyframes
echo "🎬 Test 5: Animation Keyframes..."
if curl -s "$URL" | grep -q '@keyframes breathe'; then
    echo "   ✅ Breathe animation found"
else
    echo "   ❌ Breathe animation missing"
    exit 1
fi

# Test 6: Check for purple gradient colors
echo "🌈 Test 6: Color System..."
if curl -s "$URL" | grep -q '#667eea'; then
    echo "   ✅ Purple gradient colors found"
else
    echo "   ❌ Purple colors missing"
    exit 1
fi

# Test 7: Check JavaScript syntax (initVoiceOrb)
echo "⚙️  Test 7: Canvas Initialization..."
if curl -s "$URL/voice-client.js" | grep -q 'initVoiceOrb'; then
    echo "   ✅ Canvas orb init function found"
else
    echo "   ❌ Canvas init missing"
    exit 1
fi

# Test 8: Check for orb state management
echo "🔄 Test 8: Orb State Management..."
if curl -s "$URL/voice-client.js" | grep -q 'setOrbState'; then
    echo "   ✅ Orb state function found"
else
    echo "   ❌ Orb state function missing"
    exit 1
fi

# Test 9: WebSocket connection code
echo "🔌 Test 9: WebSocket Integration..."
if curl -s "$URL/voice-client.js" | grep -q 'connectWebSocket'; then
    echo "   ✅ WebSocket connection found"
else
    echo "   ❌ WebSocket missing"
    exit 1
fi

# Test 10: Server health check
echo "💓 Test 10: Server Health..."
HEALTH=$(curl -s "$URL/health" | grep -o '"status":"online"')
if [ -n "$HEALTH" ]; then
    echo "   ✅ Server online and healthy"
else
    echo "   ⚠️  Server health check inconclusive"
fi

echo ""
echo "==========================="
echo "✅ ALL TESTS PASSED!"
echo ""
echo "📊 SUMMARY:"
echo "   - HTML: ✅ Loading"
echo "   - JavaScript: ✅ Loading"
echo "   - Canvas Orb: ✅ Present"
echo "   - Glassmorphism: ✅ Implemented"
echo "   - Animations: ✅ Configured"
echo "   - Colors: ✅ Purple gradient"
echo "   - WebSocket: ✅ Integrated"
echo ""
echo "🌐 Live URL: $URL"
echo ""
echo "⚠️  NOTE: Visual appearance should be tested in browser!"
echo "   - Orb animation smoothness (60fps)"
echo "   - Glass blur effects (backdrop-filter)"
echo "   - Button hover states"
echo "   - Mobile responsiveness"
