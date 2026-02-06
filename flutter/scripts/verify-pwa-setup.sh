#!/bin/bash
# Flutter Web + PWA Verification Script
# Checks that all components are properly configured

echo "🔍 Friday Voice App - PWA Verification"
echo "======================================"
echo ""

FLUTTER_DIR="/root/.openclaw/workspace/friday-voice-app/flutter"
WEB_DIR="$FLUTTER_DIR/web"
SCRIPTS_DIR="$FLUTTER_DIR/scripts"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

check_file() {
  local file=$1
  local desc=$2
  
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $desc"
    ((PASSED++))
    return 0
  else
    echo -e "${RED}✗${NC} $desc (missing: $file)"
    ((FAILED++))
    return 1
  fi
}

check_dir() {
  local dir=$1
  local desc=$2
  
  if [ -d "$dir" ]; then
    echo -e "${GREEN}✓${NC} $desc"
    ((PASSED++))
    return 0
  else
    echo -e "${RED}✗${NC} $desc (missing: $dir)"
    ((FAILED++))
    return 1
  fi
}

check_content() {
  local file=$1
  local pattern=$2
  local desc=$3
  
  if [ -f "$file" ] && grep -q "$pattern" "$file"; then
    echo -e "${GREEN}✓${NC} $desc"
    ((PASSED++))
    return 0
  else
    echo -e "${RED}✗${NC} $desc"
    ((FAILED++))
    return 1
  fi
}

# 1. Directory Structure
echo "📁 Directory Structure:"
check_dir "$WEB_DIR" "web/ directory exists"
check_dir "$SCRIPTS_DIR" "scripts/ directory exists"
echo ""

# 2. PWA Files
echo "📱 PWA Files:"
check_file "$WEB_DIR/manifest.json" "manifest.json exists"
check_file "$WEB_DIR/sw.js" "Service Worker exists"
check_file "$WEB_DIR/index.html" "index.html exists"
check_file "$WEB_DIR/_headers" "Security headers (_headers)"
check_file "$WEB_DIR/_redirects" "SPA redirects (_redirects)"
echo ""

# 3. Deployment Scripts
echo "🚀 Deployment Scripts:"
check_file "$SCRIPTS_DIR/deploy-web.sh" "deploy-web.sh exists"
if [ -f "$SCRIPTS_DIR/deploy-web.sh" ]; then
  if [ -x "$SCRIPTS_DIR/deploy-web.sh" ]; then
    echo -e "${GREEN}✓${NC} deploy-web.sh is executable"
    ((PASSED++))
  else
    echo -e "${YELLOW}⚠${NC} deploy-web.sh not executable (run: chmod +x)"
    chmod +x "$SCRIPTS_DIR/deploy-web.sh"
    echo -e "${GREEN}✓${NC} Fixed: made executable"
  fi
fi
echo ""

# 4. Manifest Validation
echo "🎨 PWA Manifest Validation:"
if [ -f "$WEB_DIR/manifest.json" ]; then
  check_content "$WEB_DIR/manifest.json" '"name"' "Manifest has 'name' field"
  check_content "$WEB_DIR/manifest.json" '"short_name"' "Manifest has 'short_name' field"
  check_content "$WEB_DIR/manifest.json" '"start_url"' "Manifest has 'start_url' field"
  check_content "$WEB_DIR/manifest.json" '"display".*standalone' "Manifest uses standalone display"
  check_content "$WEB_DIR/manifest.json" '"icons"' "Manifest has icons array"
  
  # Check icon sizes
  ICON_SIZES=("192x192" "512x512")
  for size in "${ICON_SIZES[@]}"; do
    if grep -q "\"sizes\": \"$size\"" "$WEB_DIR/manifest.json"; then
      echo -e "${GREEN}✓${NC} Manifest includes ${size} icon"
      ((PASSED++))
    else
      echo -e "${RED}✗${NC} Manifest missing ${size} icon"
      ((FAILED++))
    fi
  done
fi
echo ""

# 5. Service Worker Validation
echo "⚙️  Service Worker Validation:"
if [ -f "$WEB_DIR/sw.js" ]; then
  check_content "$WEB_DIR/sw.js" "addEventListener.*install" "SW has install event"
  check_content "$WEB_DIR/sw.js" "addEventListener.*activate" "SW has activate event"
  check_content "$WEB_DIR/sw.js" "addEventListener.*fetch" "SW has fetch event"
  check_content "$WEB_DIR/sw.js" "caches.open" "SW uses Cache API"
  check_content "$WEB_DIR/sw.js" "addEventListener.*sync" "SW supports background sync"
  check_content "$WEB_DIR/sw.js" "addEventListener.*push" "SW supports push notifications"
fi
echo ""

# 6. Security Headers
echo "🔒 Security Headers:"
if [ -f "$WEB_DIR/_headers" ]; then
  check_content "$WEB_DIR/_headers" "X-Frame-Options" "X-Frame-Options header"
  check_content "$WEB_DIR/_headers" "X-Content-Type-Options" "X-Content-Type-Options header"
  check_content "$WEB_DIR/_headers" "Content-Security-Policy" "CSP header"
  check_content "$WEB_DIR/_headers" "Permissions-Policy" "Permissions-Policy header"
fi
echo ""

# 7. Index.html Validation
echo "📄 index.html Validation:"
if [ -f "$WEB_DIR/index.html" ]; then
  check_content "$WEB_DIR/index.html" "<link rel=\"manifest\"" "Manifest linked in HTML"
  check_content "$WEB_DIR/index.html" "serviceWorker.register" "SW registration script"
  check_content "$WEB_DIR/index.html" "beforeinstallprompt" "Install prompt handler"
  check_content "$WEB_DIR/index.html" "theme-color" "Theme color meta tag"
fi
echo ""

# 8. Documentation
echo "📚 Documentation:"
check_file "/root/.openclaw/workspace/friday-voice-app/FLUTTER_WEB_PWA.md" "FLUTTER_WEB_PWA.md exists"
echo ""

# 9. Flutter Check (optional)
echo "📦 Flutter Environment:"
if command -v flutter &> /dev/null; then
  echo -e "${GREEN}✓${NC} Flutter is installed"
  FLUTTER_VERSION=$(flutter --version | head -1)
  echo "  Version: $FLUTTER_VERSION"
  ((PASSED++))
else
  echo -e "${YELLOW}⚠${NC} Flutter not installed (required for building)"
  echo "  Install: https://flutter.dev/docs/get-started/install"
fi
echo ""

# Summary
echo "======================================"
echo "📊 Verification Summary"
echo "======================================"
echo -e "${GREEN}Passed:${NC} $PASSED"
echo -e "${RED}Failed:${NC} $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All checks passed!${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Test locally: cd $FLUTTER_DIR && ./scripts/deploy-web.sh"
  echo "  2. Deploy to Cloudflare: export DEPLOY_TARGET=cloudflare && ./scripts/deploy-web.sh"
  echo ""
  exit 0
else
  echo -e "${RED}❌ Some checks failed. Please review the errors above.${NC}"
  echo ""
  exit 1
fi
