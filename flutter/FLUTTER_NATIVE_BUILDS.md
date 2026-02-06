# Friday Voice App - Flutter Native Build Documentation

Complete guide for building, signing, and deploying Friday Voice Assistant on Android and iOS.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Project Structure](#project-structure)
3. [Android Setup](#android-setup)
4. [iOS Setup](#ios-setup)
5. [Build Scripts](#build-scripts)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [App Store Deployment](#app-store-deployment)
8. [Troubleshooting](#troubleshooting)
9. [Optimization Tips](#optimization-tips)

---

## 🚀 Quick Start

### Prerequisites

**Required:**
- Flutter SDK 3.16+ ([installation guide](https://flutter.dev/docs/get-started/install))
- Git

**Android builds:**
- Java JDK 17+
- Android SDK (via Android Studio or command line tools)

**iOS builds (macOS only):**
- Xcode 15+ (from App Store)
- CocoaPods (`sudo gem install cocoapods`)

### First Build

```bash
# Clone and navigate
cd friday-voice-app/flutter

# Get dependencies
flutter pub get

# Run on connected device/emulator
flutter run

# Build for Android
./scripts/build-android.sh debug

# Build for iOS (macOS only)
./scripts/build-ios.sh debug
```

---

## 📁 Project Structure

```
friday-voice-app/flutter/
├── android/                    # Android native code
│   ├── app/
│   │   ├── build.gradle       # App-level build config
│   │   ├── proguard-rules.pro # Code obfuscation rules
│   │   └── src/main/
│   │       ├── AndroidManifest.xml  # Permissions & app config
│   │       ├── kotlin/        # Kotlin/Java code
│   │       └── res/           # Resources (icons, strings, etc.)
│   ├── build.gradle           # Project-level build config
│   └── gradle.properties      # Gradle settings
├── ios/                       # iOS native code
│   ├── Runner/
│   │   ├── Info.plist        # App config & permissions
│   │   ├── AppDelegate.swift # App lifecycle
│   │   └── Assets.xcassets/  # App icons & images
│   ├── Podfile               # CocoaPods dependencies
│   └── Runner.xcodeproj/     # Xcode project
├── lib/                      # Flutter/Dart code
│   └── main.dart            # App entry point
├── scripts/                  # Build automation
│   ├── build-android.sh     # Android build script
│   └── build-ios.sh         # iOS build script
├── docs/                     # Documentation
│   ├── ANDROID_KEYSTORE_SETUP.md
│   ├── IOS_CODE_SIGNING.md
│   ├── STORE_LISTING_GUIDE.md
│   └── PRIVACY_POLICY_TEMPLATE.md
├── .github/workflows/        # CI/CD configs
│   └── build.yml            # GitHub Actions workflow
└── pubspec.yaml             # Flutter dependencies
```

---

## 🤖 Android Setup

### Configuration Files

**android/app/build.gradle:**
- Min SDK: 21 (Android 5.0 - covers 99% devices)
- Target SDK: 34 (required by Play Store)
- Build variants: debug, release
- Code signing configuration
- ProGuard/R8 optimization

**android/app/src/main/AndroidManifest.xml:**
- App name, icon, theme
- Permissions: `RECORD_AUDIO`, `INTERNET`, `WAKE_LOCK`
- Activity configuration
- Background modes

**android/app/proguard-rules.pro:**
- Code obfuscation rules
- Keep Flutter/Kotlin classes
- Optimize release builds
- Remove debug logging

### Permissions Explained

```xml
<!-- Required for voice commands -->
<uses-permission android:name="android.permission.RECORD_AUDIO" />

<!-- Required for API calls, calendar sync -->
<uses-permission android:name="android.permission.INTERNET" />

<!-- Keep screen on during voice interaction -->
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

### App Icons

Adaptive icons in `android/app/src/main/res/`:
- mipmap-mdpi (48x48)
- mipmap-hdpi (72x72)
- mipmap-xhdpi (96x96)
- mipmap-xxhdpi (144x144)
- mipmap-xxxhdpi (192x192)

**Generate icons:**
1. Use [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html)
2. Or Flutter launcher_icons package:
   ```yaml
   # pubspec.yaml
   dev_dependencies:
     flutter_launcher_icons: ^0.13.1
   
   flutter_icons:
     android: true
     image_path: "assets/icon.png"
   ```
   ```bash
   flutter pub run flutter_launcher_icons
   ```

### Signing for Release

**Step 1: Create Keystore**

See detailed guide: [docs/ANDROID_KEYSTORE_SETUP.md](docs/ANDROID_KEYSTORE_SETUP.md)

```bash
keytool -genkey -v -keystore friday-release.keystore \
  -alias friday-key -keyalg RSA -keysize 2048 -validity 10000
```

**Step 2: Configure Signing**

Create `android/key.properties`:
```properties
storePassword=YOUR_PASSWORD
keyPassword=YOUR_PASSWORD
keyAlias=friday-key
storeFile=/path/to/friday-release.keystore
```

**Step 3: Build Signed APK**

```bash
./scripts/build-android.sh release
```

Output: `build/app/outputs/flutter-apk/`
- `app-armeabi-v7a-release.apk` (32-bit ARM)
- `app-arm64-v8a-release.apk` (64-bit ARM)
- `app-x86_64-release.apk` (Intel emulators)
- `app-release.apk` (universal, larger file)

### APK vs AAB

**APK (Android Package):**
- Direct install file
- Larger size (includes all architectures)
- Good for: Testing, sideloading, alternative stores

**AAB (Android App Bundle):**
- Play Store only
- Smaller downloads (Google generates optimized APKs)
- Required for Play Store since August 2021

Build AAB:
```bash
flutter build appbundle --release
```

---

## 🍎 iOS Setup

### Configuration Files

**ios/Runner/Info.plist:**
- App name, bundle ID, version
- Permissions: Microphone usage description
- Background modes: Audio
- Deployment target: iOS 12.0+

**ios/Podfile:**
- CocoaPods dependencies
- Platform version: iOS 12.0
- Build settings (optimization, signing)

**ios/Runner/Assets.xcassets/AppIcon.appiconset/:**
- All required icon sizes (20x20 to 1024x1024)
- No transparency allowed
- PNG format

### Permissions Explained

```xml
<!-- Info.plist -->
<key>NSMicrophoneUsageDescription</key>
<string>Friday needs microphone access to listen to voice commands.</string>

<key>UIBackgroundModes</key>
<array>
    <string>audio</string>  <!-- Continue playing/recording in background -->
</array>
```

### App Icons

Required sizes for iOS:
- 20x20 (@1x, @2x, @3x)
- 29x29 (@1x, @2x, @3x)
- 40x40 (@1x, @2x, @3x)
- 60x60 (@2x, @3x)
- 76x76 (@1x, @2x)
- 83.5x83.5 (@2x) - iPad Pro
- 1024x1024 (@1x) - App Store

**Generate icons:**
```bash
# Use appicon.co or similar tool
# Or use flutter_launcher_icons package (same as Android)
```

### Code Signing

See detailed guide: [docs/IOS_CODE_SIGNING.md](docs/IOS_CODE_SIGNING.md)

**Quick setup (automatic signing):**
1. Open `ios/Runner.xcworkspace` in Xcode
2. Select Runner target → Signing & Capabilities
3. Enable "Automatically manage signing"
4. Select your Team
5. Bundle Identifier: `com.rendetalje.friday`

**Manual signing:**
1. Create certificates in [developer.apple.com](https://developer.apple.com)
2. Register App ID
3. Create provisioning profiles
4. Configure in Xcode

### Building for iOS

```bash
# Debug build (no code signing)
./scripts/build-ios.sh debug

# Release build (requires signing)
./scripts/build-ios.sh release

# For App Store submission, use Xcode:
# 1. Open ios/Runner.xcworkspace
# 2. Product → Archive
# 3. Distribute → App Store Connect
```

---

## 🛠️ Build Scripts

### build-android.sh

**Usage:**
```bash
./scripts/build-android.sh [debug|release]
```

**Features:**
- Automatic Flutter version check
- Dependency installation
- Split APKs by architecture (smaller downloads)
- Code obfuscation for release
- Debug symbols for crash reporting
- APK size verification (<50MB target)
- Optional device installation

**Example:**
```bash
# Build debug APK
./scripts/build-android.sh debug

# Build optimized release APKs
./scripts/build-android.sh release

# Build and install
./scripts/build-android.sh debug
# Then select 'y' when prompted
```

### build-ios.sh

**Usage:**
```bash
./scripts/build-ios.sh [debug|release]
```

**Features:**
- macOS/Xcode verification
- Flutter version check
- CocoaPods dependency installation
- Build without code signing (for CI)
- Instructions for manual signing
- Optional device installation

**Example:**
```bash
# Build debug app
./scripts/build-ios.sh debug

# Build release (unsigned - for manual signing in Xcode)
./scripts/build-ios.sh release
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

File: `.github/workflows/build.yml`

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main`
- Manual workflow dispatch

**Jobs:**

1. **Test & Lint**
   - Run Flutter analyzer
   - Execute unit tests
   - Runs on every commit

2. **Build Android Debug**
   - Build debug APK
   - Upload artifact (7-day retention)
   - Runs on all branches

3. **Build Android Release**
   - Build signed release APKs
   - Split by architecture
   - Upload artifacts (30-day retention)
   - Upload debug symbols (90-day retention)
   - Only runs on `main` branch

4. **Build iOS**
   - Install CocoaPods dependencies
   - Build unsigned iOS app
   - Upload artifact (7-day retention)
   - Runs on macOS runner

### Required GitHub Secrets

For release builds, add these secrets in GitHub repo settings:

**Android:**
- `ANDROID_KEYSTORE_BASE64`: Base64-encoded keystore file
- `ANDROID_KEYSTORE_PASSWORD`: Keystore password
- `ANDROID_KEY_PASSWORD`: Key password
- `ANDROID_KEY_ALIAS`: Key alias (e.g., `friday-key`)

**Create secrets:**
```bash
# Encode keystore
base64 -i friday-release.keystore -o keystore.b64

# Add the content of keystore.b64 as ANDROID_KEYSTORE_BASE64 secret
```

**iOS:**
- `IOS_CERTIFICATE_BASE64`: Distribution certificate (.p12)
- `IOS_CERTIFICATE_PASSWORD`: Certificate password
- `IOS_PROVISION_PROFILE_BASE64`: Provisioning profile

### Local CI Testing

Test workflow locally using [act](https://github.com/nektos/act):

```bash
# Install act
brew install act  # macOS
# or download from GitHub releases

# Run workflow locally
act push

# Run specific job
act -j build-android
```

---

## 📱 App Store Deployment

### Google Play Store

**Preparation:**
1. Create Play Console account ($25 one-time fee)
2. Build signed release APK/AAB
3. Prepare store listing (see [docs/STORE_LISTING_GUIDE.md](docs/STORE_LISTING_GUIDE.md))
4. Create privacy policy (see [docs/PRIVACY_POLICY_TEMPLATE.md](docs/PRIVACY_POLICY_TEMPLATE.md))

**Required Assets:**
- App icon (512x512 PNG)
- Feature graphic (1024x500)
- Screenshots (min 2, max 8 per device type)
- Privacy policy URL
- Store listing (Danish + English)

**Submission Steps:**
1. Play Console → Create App
2. Fill in app details
3. Upload APK/AAB
4. Complete store listing
5. Set pricing and distribution
6. Submit for review

**Review time:** 1-3 days

### Apple App Store

**Preparation:**
1. Join Apple Developer Program ($99/year)
2. Configure code signing in Xcode
3. Prepare store listing (see [docs/STORE_LISTING_TEMPLATE_EN.md](docs/STORE_LISTING_TEMPLATE_EN.md))
4. Create App Store Connect app

**Required Assets:**
- App icon (1024x1024 PNG, no transparency)
- Screenshots (all required sizes)
- Privacy policy URL
- App description (English + Danish)

**Submission Steps:**
1. Xcode → Product → Archive
2. Distribute → App Store Connect → Upload
3. App Store Connect → Fill in metadata
4. Select uploaded build
5. Submit for review

**Review time:** 1-7 days (average 2-3 days)

**Full guides:**
- [docs/STORE_LISTING_GUIDE.md](docs/STORE_LISTING_GUIDE.md)
- [docs/STORE_LISTING_TEMPLATE_EN.md](docs/STORE_LISTING_TEMPLATE_EN.md)
- [docs/STORE_LISTING_TEMPLATE_DA.md](docs/STORE_LISTING_TEMPLATE_DA.md)

---

## 🐛 Troubleshooting

### Common Android Issues

**"Flutter SDK not found"**
```bash
# Add Flutter to PATH
export PATH="$PATH:/path/to/flutter/bin"

# Or in ~/.zshrc / ~/.bashrc
echo 'export PATH="$PATH:/path/to/flutter/bin"' >> ~/.zshrc
source ~/.zshrc
```

**"Execution failed for task ':app:lintVitalRelease'"**
```gradle
// android/app/build.gradle
android {
    lintOptions {
        checkReleaseBuilds false
        // Or fix the warnings
    }
}
```

**"Could not find or load main class org.gradle.wrapper.GradleWrapperMain"**
```bash
cd android
gradle wrapper
```

**APK size too large (>50MB)**
- Use `--split-per-abi` (already in build script)
- Remove unused assets
- Enable ProGuard/R8 (already enabled)
- Use vector graphics instead of PNGs
- Compress images

### Common iOS Issues

**"Xcode license not accepted"**
```bash
sudo xcodebuild -license accept
```

**"CocoaPods not installed"**
```bash
sudo gem install cocoapods
pod setup
```

**"No profile for team 'XXXXXXX' matching 'com.rendetalje.friday' found"**
- Open Xcode → Preferences → Accounts
- Download Manual Profiles
- Or enable Automatic Signing

**"The operation couldn't be completed. Unable to launch..."**
- Device iOS version < deployment target (iOS 12)
- Update device or lower deployment target
- Check code signing settings

**Build succeeds but app crashes on launch**
- Check iOS version compatibility
- Review crash logs in Xcode → Window → Devices and Simulators
- Verify all plugins are iOS-compatible

### Flutter Issues

**"Target file ... does not exist"**
```bash
flutter clean
flutter pub get
```

**"Waiting for another flutter command to release the startup lock"**
```bash
# Kill Flutter processes
killall -9 dart flutter

# Delete lock file
rm -rf /path/to/flutter/bin/cache/lockfile
```

**Build fails with "Gradle task assembleDebug failed"**
```bash
cd android
./gradlew clean
cd ..
flutter clean
flutter pub get
flutter build apk --debug
```

---

## ⚡ Optimization Tips

### Reduce App Size

**Android:**
1. Enable R8 shrinking (already enabled)
2. Use ProGuard rules (already configured)
3. Split APKs by architecture (already enabled)
4. Remove unused resources:
   ```bash
   flutter build apk --release --split-per-abi --tree-shake-icons
   ```
5. Compress images:
   ```bash
   # Use pngquant, ImageOptim, or tinypng.com
   ```

**iOS:**
1. Enable bitcode (optional, in Podfile)
2. Strip symbols in release:
   ```
   Build Settings → Strip Debug Symbols During Copy = YES
   ```
3. Optimize images (same as Android)
4. Use App Thinning (automatic in App Store)

### Improve Build Speed

1. **Enable Gradle daemon** (already in gradle.properties)
2. **Increase memory:**
   ```properties
   # android/gradle.properties
   org.gradle.jvmargs=-Xmx4096m
   ```
3. **Use Flutter caching:**
   ```bash
   flutter precache
   ```
4. **Parallel builds** (already enabled in gradle.properties)

### Performance Optimization

1. **Use const widgets** where possible
2. **Lazy load lists:** Use `ListView.builder`
3. **Optimize images:** Use appropriate resolutions
4. **Profile performance:**
   ```bash
   flutter run --profile
   flutter run --release  # Test actual performance
   ```
5. **Analyze build:**
   ```bash
   flutter build apk --analyze-size
   flutter build ios --analyze-size
   ```

---

## 📊 Build Statistics

**Target Sizes:**
- Android APK (per architecture): <25MB
- Android AAB: <30MB
- iOS IPA: <40MB

**Actual sizes will vary based on:**
- Assets (images, fonts)
- Dependencies
- Flutter framework version

**Check sizes:**
```bash
# After building
ls -lh build/app/outputs/flutter-apk/*.apk
ls -lh build/ios/iphoneos/*.ipa
```

---

## 📚 Additional Resources

**Official Documentation:**
- [Flutter Deployment Guide](https://flutter.dev/docs/deployment)
- [Android App Signing](https://developer.android.com/studio/publish/app-signing)
- [iOS App Distribution](https://developer.apple.com/app-store/submissions/)

**Tools:**
- [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/)
- [App Icon Generator](https://www.appicon.co/)
- [Screenshot Generator](https://screenshots.pro/)

**Community:**
- [Flutter Dev Discord](https://discord.gg/flutter)
- [Stack Overflow - Flutter](https://stackoverflow.com/questions/tagged/flutter)

---

## 🎯 Quick Reference

**Common Commands:**
```bash
# Development
flutter run                          # Run on connected device
flutter run -d <device-id>          # Run on specific device
flutter devices                      # List connected devices

# Building
flutter build apk --release          # Build release APK
flutter build appbundle --release    # Build AAB for Play Store
flutter build ios --release          # Build iOS release

# Testing
flutter test                         # Run unit tests
flutter analyze                      # Run static analysis

# Maintenance
flutter clean                        # Clean build cache
flutter pub get                      # Get dependencies
flutter upgrade                      # Update Flutter SDK
flutter doctor                       # Check installation
```

**File Locations:**
- Android APKs: `build/app/outputs/flutter-apk/`
- Android AAB: `build/app/outputs/bundle/release/`
- iOS build: `build/ios/iphoneos/Runner.app`
- iOS archive: Created in Xcode

---

## ✅ Deployment Checklist

Before submitting to stores:

- [ ] App builds without errors (debug + release)
- [ ] Tested on physical devices (Android + iOS)
- [ ] All permissions explained in UI
- [ ] Privacy policy created and hosted
- [ ] App icon designed (1024x1024)
- [ ] Screenshots captured (all required sizes)
- [ ] Store listing written (English + Danish)
- [ ] Keystore/certificates backed up securely
- [ ] Version number set correctly
- [ ] Release notes prepared
- [ ] Support email set up and monitored
- [ ] Crash reporting configured (if using)
- [ ] Analytics set up (if using)
- [ ] Beta tested with real users
- [ ] Legal compliance checked (GDPR, etc.)

---

**Last Updated:** February 6, 2026
**Version:** 1.0
**Maintainer:** Friday Development Team
