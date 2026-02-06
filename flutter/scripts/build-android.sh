#!/bin/bash
# Build script for Friday Voice App - Android
# Usage: ./build-android.sh [debug|release]

set -e

BUILD_TYPE=${1:-debug}
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🤖 Building Friday Voice App for Android ($BUILD_TYPE)..."

cd "$PROJECT_ROOT"

# Check if Flutter is installed
if ! command -v flutter &> /dev/null; then
    echo "❌ Flutter not found. Please install Flutter SDK first."
    echo "Visit: https://flutter.dev/docs/get-started/install"
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
flutter clean

# Get dependencies
echo "📦 Getting dependencies..."
flutter pub get

# Build based on type
if [ "$BUILD_TYPE" = "release" ]; then
    echo "🔨 Building release APK..."
    
    # Check if keystore is configured
    if [ ! -f "android/key.properties" ]; then
        echo "⚠️  WARNING: No keystore configured!"
        echo "For production release, create android/key.properties with:"
        echo "  storePassword=<password>"
        echo "  keyPassword=<password>"
        echo "  keyAlias=<alias>"
        echo "  storeFile=<path to keystore>"
        echo ""
        echo "Building unsigned release APK..."
    fi
    
    # Build release APK with optimizations
    flutter build apk --release \
        --split-per-abi \
        --obfuscate \
        --split-debug-info=build/app/outputs/symbols
    
    echo "✅ Release APK built successfully!"
    echo "📦 APKs location: build/app/outputs/flutter-apk/"
    ls -lh build/app/outputs/flutter-apk/*.apk
    
    # Show APK sizes
    echo ""
    echo "📊 APK Sizes:"
    for apk in build/app/outputs/flutter-apk/*.apk; do
        size=$(du -h "$apk" | cut -f1)
        echo "  - $(basename "$apk"): $size"
    done
    
    # Check if any APK exceeds 50MB
    for apk in build/app/outputs/flutter-apk/*.apk; do
        size_bytes=$(stat -f%z "$apk" 2>/dev/null || stat -c%s "$apk" 2>/dev/null)
        size_mb=$((size_bytes / 1024 / 1024))
        if [ $size_mb -gt 50 ]; then
            echo "⚠️  WARNING: $(basename "$apk") is ${size_mb}MB (target: <50MB)"
        fi
    done
    
elif [ "$BUILD_TYPE" = "debug" ]; then
    echo "🔨 Building debug APK..."
    flutter build apk --debug
    
    echo "✅ Debug APK built successfully!"
    echo "📦 APK location: build/app/outputs/flutter-apk/app-debug.apk"
    ls -lh build/app/outputs/flutter-apk/app-debug.apk
    
else
    echo "❌ Invalid build type: $BUILD_TYPE"
    echo "Usage: $0 [debug|release]"
    exit 1
fi

# Optional: Install to connected device
read -p "📱 Install to connected device? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    flutter install
    echo "✅ Installed to device"
fi

echo ""
echo "🎉 Build complete!"
