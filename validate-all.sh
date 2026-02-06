#!/bin/bash
echo "🔍 FRIDAY VOICE APP - CODE VALIDATION"
echo "======================================"
echo ""

# 1. JavaScript Syntax Check
echo "1️⃣ JavaScript Syntax Validation..."
node -c voice-client.js && echo "✅ voice-client.js: OK" || echo "❌ voice-client.js: FEJL"
node -c server.js && echo "✅ server.js: OK" || echo "❌ server.js: FEJL"
node -c tts-integration.js && echo "✅ tts-integration.js: OK" || echo "❌ tts-integration.js: FEJL"
node -c wake-word.js && echo "✅ wake-word.js: OK" || echo "❌ wake-word.js: FEJL"
echo ""

# 2. HTML Validation (basic)
echo "2️⃣ HTML Structure Check..."
if grep -q "<!DOCTYPE html>" index.html; then
    echo "✅ DOCTYPE found"
else
    echo "❌ DOCTYPE missing"
fi

if grep -q "<html" index.html && grep -q "</html>" index.html; then
    echo "✅ HTML tags closed"
else
    echo "❌ HTML tags not closed"
fi

if grep -q "<script src=\"voice-client.js\">" index.html; then
    echo "✅ voice-client.js loaded"
else
    echo "❌ voice-client.js not loaded"
fi
echo ""

# 3. Critical Elements Check
echo "3️⃣ Critical UI Elements..."
grep -q 'id="mic-btn"' index.html && echo "✅ Mic button exists" || echo "❌ Mic button missing"
grep -q 'id="settings-modal"' index.html && echo "✅ Settings modal exists" || echo "❌ Settings modal missing"
grep -q 'id="chat"' index.html && echo "✅ Chat container exists" || echo "❌ Chat container missing"
grep -q 'id="voice-orb"' index.html && echo "✅ Voice orb exists" || echo "❌ Voice orb missing"
grep -q 'id="onboarding-guide"' index.html && echo "✅ Onboarding guide exists" || echo "❌ Onboarding guide missing"
grep -q 'id="transcript-panel"' index.html && echo "✅ Transcript panel exists" || echo "❌ Transcript panel missing"
grep -q 'id="suggestion-chips"' index.html && echo "✅ Suggestion chips exist" || echo "❌ Suggestion chips missing"
echo ""

# 4. Dependencies Check
echo "4️⃣ Node Dependencies..."
if [ -f "package.json" ]; then
    echo "✅ package.json exists"
    if [ -d "node_modules" ]; then
        echo "✅ node_modules installed"
    else
        echo "⚠️  node_modules missing (run: npm install)"
    fi
else
    echo "❌ package.json missing"
fi
echo ""

# 5. Environment Check
echo "5️⃣ Environment Configuration..."
if [ -f ".env" ]; then
    echo "✅ .env exists"
    if grep -q "ELEVENLABS_API_KEY" .env; then
        echo "✅ ElevenLabs API key configured"
    else
        echo "❌ ElevenLabs API key missing"
    fi
else
    echo "❌ .env missing"
fi
echo ""

# 6. File Structure
echo "6️⃣ File Structure..."
[ -f "index.html" ] && echo "✅ index.html" || echo "❌ index.html missing"
[ -f "voice-client.js" ] && echo "✅ voice-client.js" || echo "❌ voice-client.js missing"
[ -f "server.js" ] && echo "✅ server.js" || echo "❌ server.js missing"
[ -f "tts-integration.js" ] && echo "✅ tts-integration.js" || echo "❌ tts-integration.js missing"
[ -f "wake-word.js" ] && echo "✅ wake-word.js" || echo "❌ wake-word.js missing"
[ -f "DEPLOYMENT-SUMMARY.md" ] && echo "✅ DEPLOYMENT-SUMMARY.md" || echo "⚠️  DEPLOYMENT-SUMMARY.md missing"
[ -f "DESIGN-SPEC-2026.md" ] && echo "✅ DESIGN-SPEC-2026.md" || echo "⚠️  DESIGN-SPEC-2026.md missing"
echo ""

# 7. Git Status
echo "7️⃣ Git Repository..."
if [ -d ".git" ]; then
    echo "✅ Git initialized"
    echo "📝 Last commit: $(git log -1 --oneline)"
    echo "📊 Total commits: $(git rev-list --count HEAD)"
else
    echo "❌ Git not initialized"
fi
echo ""

echo "======================================"
echo "✅ VALIDATION COMPLETE"
