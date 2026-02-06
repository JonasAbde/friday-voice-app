#!/bin/bash
echo "🔍 FRIDAY VOICE APP - CODE VALIDATION"
echo "======================================"
echo ""

# 1. JavaScript Syntax Check
echo "1️⃣ JavaScript Syntax Validation..."
for file in *.js; do
    if [ -f "$file" ] && [ "$file" != "postcss.config.js" ] && [ "$file" != "tailwind.config.js" ]; then
        if node -c "$file" 2>/dev/null; then
            echo "✅ $file: OK"
        else
            echo "❌ $file: FEJL"
        fi
    fi
done
echo ""

# 2. HTML Validation
echo "2️⃣ HTML Structure Check..."
grep -q "<!DOCTYPE html>" index.html && echo "✅ DOCTYPE found" || echo "❌ DOCTYPE missing"
grep -q "<html" index.html && grep -q "</html>" index.html && echo "✅ HTML tags closed" || echo "❌ HTML not closed"
grep -q 'src="voice-client.js"' index.html && echo "✅ voice-client.js loaded" || echo "❌ voice-client.js not loaded"
echo ""

# 3. Critical Elements
echo "3️⃣ Critical UI Elements..."
for element in "mic-btn" "settings-modal" "chat" "voice-orb" "onboarding-guide" "transcript-panel" "suggestion-chips"; do
    grep -q "id=\"$element\"" index.html && echo "✅ $element exists" || echo "❌ $element missing"
done
echo ""

# 4. Dependencies
echo "4️⃣ Dependencies..."
[ -f "package.json" ] && echo "✅ package.json" || echo "❌ package.json missing"
[ -d "node_modules" ] && echo "✅ node_modules installed" || echo "⚠️  node_modules missing"
echo ""

# 5. Environment
echo "5️⃣ Environment..."
[ -f ".env" ] && echo "✅ .env exists" || echo "❌ .env missing"
grep -q "ELEVENLABS_API_KEY" .env 2>/dev/null && echo "✅ ElevenLabs configured" || echo "❌ ElevenLabs not configured"
echo ""

# 6. Server Status
echo "6️⃣ Server Status..."
if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8765 | grep -q "200\|404"; then
    echo "✅ Server responding"
else
    echo "❌ Server not responding"
fi
echo ""

echo "======================================"
echo "✅ VALIDATION COMPLETE"
