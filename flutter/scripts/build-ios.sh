#!/bin/bash
# Build script for Friday Voice App - iOS
# Usage: ./build-ios.sh [debug|release]
# NOTE: Requires macOS with Xcode installed

set -e

BUILD_TYPE=${1:-debug}
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🍎 Building Friday Voice App for iOS ($BUILD_TYPE)..."

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ iOS builds require macOS with Xcode installed."
    echo "Current OS: $OSTYPE"
    exit 1
fi

cd "$PROJECT_ROOT"

# Check if Flutter is installed
if ! command -v flutter &> /dev/null; then
    echo "❌ Flutter not found. Please install Flutter SDK first."
    echo "Visit: https://flutter.dev/docs/get-started/install"
    exit 1
fi

# Check if Xcode is installed
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Xcode not found. Please install Xcode from the App Store."
    exit 1
fi

# Check Xcode license
if ! xcodebuild -checkFirstLaunchStatus; then
    echo "⚠️  Xcode license not accepted. Run: sudo xcodebuild -license"
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
flutter clean

# Get dependencies
echo "📦 Getting dependencies..."
flutter pub get

# Install CocoaPods dependencies
echo "📦 Installing iOS dependencies (CocoaPods)..."
cd ios
pod install --repo-update
cd ..

# Build based on type
if [ "$BUILD_TYPE" = "release" ]; then
    echo "🔨 Building release IPA..."
    
    # Check if code signing is configured
    echo "⚠️  NOTE: Release builds require proper code signing configuration in Xcode."
    echo "Make sure you've configured:"
    echo "  1. Team ID in Xcode"
    echo "  2. Bundle Identifier: com.rendetalje.friday"
    echo "  3. Provisioning Profile for distribution"
    echo ""
    
    # Build release without code signing (for CI or manual signing later)
    flutter build ios --release --no-codesign
    
    echo "✅ iOS app built successfully (unsigned)!"
    echo "📦 Build location: build/ios/iphoneos/Runner.app"
    
    echo ""
    echo "To create signed IPA:"
    echo "1. Open ios/Runner.xcworkspace in Xcode"
    echo "2. Select 'Runner' target"
    echo "3. Go to 'Signing & Capabilities'"
    echo "4. Select your team and provisioning profile"
    echo "5. Product -> Archive"
    echo "6. Distribute App -> App Store Connect / Ad Hoc / Enterprise"
    
elif [ "$BUILD_TYPE" = "debug" ]; then
    echo "🔨 Building debug app..."
    flutter build ios --debug --no-codesign
    
    echo "✅ Debug app built successfully!"
    echo "📦 Build location: build/ios/iphoneos/Runner.app"
    
    # Optional: Install to connected device
    read -p "📱 Install to connected device/simulator? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        flutter install
        echo "✅ Installed to device"
    fi
    
else
    echo "❌ Invalid build type: $BUILD_TYPE"
    echo "Usage: $0 [debug|release]"
    exit 1
fi

echo ""
echo "🎉 Build complete!"
