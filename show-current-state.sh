#!/bin/bash
# Quick visual validation - shows what's currently deployed
# Usage: ./show-current-state.sh

URL="https://provider-oils-myers-gary.trycloudflare.com"

echo "🌐 Friday Voice App - Current State"
echo "===================================="
echo ""
echo "📍 URL: $URL"
echo ""

# Check if server is up
echo "🔍 Checking server status..."
if curl -s "$URL/health" | grep -q "online"; then
    echo "✅ Server is ONLINE"
    echo ""
else
    echo "❌ Server is offline!"
    exit 1
fi

# Check for key visual elements
echo "🎨 Checking UI elements..."
echo ""

HTML=$(curl -s "$URL")

# Background gradient
if echo "$HTML" | grep -q "#2d1b69"; then
    echo "✅ Background: Purple gradient (#2d1b69)"
else
    echo "❌ Background: Missing purple gradient"
fi

# Voice orb
if echo "$HTML" | grep -q 'id="voice-orb"'; then
    echo "✅ Voice Orb: Canvas element present"
else
    echo "❌ Voice Orb: Missing"
fi

# Settings modal
if echo "$HTML" | grep -q 'max-w-lg'; then
    echo "✅ Settings Modal: Large size (max-w-lg)"
else
    echo "❌ Settings Modal: Still small"
fi

# Debug info hidden
if echo "$HTML" | grep -q 'id="debug-info" class="hidden'; then
    echo "✅ Debug Info: Hidden by default"
else
    echo "❌ Debug Info: Always visible"
fi

# Danish text
if echo "$HTML" | grep -q "Indlæser stemmer"; then
    echo "✅ Language: Danish (Indlæser stemmer...)"
else
    echo "❌ Language: Still English"
fi

# Close button size
if echo "$HTML" | grep -q 'text-4xl'; then
    echo "✅ Close Button: Large (text-4xl)"
else
    echo "❌ Close Button: Small"
fi

echo ""
echo "===================================="
echo "💡 To see visual result: Open URL in browser"
echo "📸 Screenshot tool installing (Puppeteer)"
echo ""
