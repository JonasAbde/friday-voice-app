# Friday Voice App - Quick Start Guide

Get Friday Voice Assistant running in 5 minutes.

## Prerequisites

Install these first:

1. **Flutter SDK** (required)
   ```bash
   # macOS
   brew install flutter
   
   # Or download from https://flutter.dev/docs/get-started/install
   ```

2. **For Android builds:**
   - Java JDK 17+: `brew install openjdk@17`
   - Android Studio (or Android SDK command-line tools)

3. **For iOS builds (macOS only):**
   - Xcode: Install from Mac App Store
   - CocoaPods: `sudo gem install cocoapods`

4. **Verify installation:**
   ```bash
   flutter doctor
   # Fix any issues shown
   ```

---

## Step 1: Clone and Setup

```bash
# Navigate to the Flutter project
cd friday-voice-app/flutter

# Get dependencies
flutter pub get

# Generate app icons (if you have icon assets)
# flutter pub run flutter_launcher_icons
```

---

## Step 2: Run on Device/Emulator

### Android

**Option A: Using Emulator**
```bash
# Start emulator (or use Android Studio AVD Manager)
flutter emulators --launch <emulator_id>

# Run app
flutter run
```

**Option B: Using Physical Device**
1. Enable Developer Options on Android device
2. Enable USB Debugging
3. Connect via USB
4. Run:
   ```bash
   flutter devices  # Verify device detected
   flutter run
   ```

### iOS (macOS only)

**Option A: Using Simulator**
```bash
# Open simulator
open -a Simulator

# Run app
flutter run
```

**Option B: Using Physical Device**
1. Connect iPhone/iPad via USB
2. Trust computer on device
3. In Xcode: Open `ios/Runner.xcworkspace`
4. Select your device
5. Run:
   ```bash
   flutter run
   ```

---

## Step 3: Build for Production

### Android Release APK

```bash
# Quick method
./scripts/build-android.sh release

# Manual method
flutter build apk --release --split-per-abi
```

**First time?** You need to create a keystore:
1. Follow: [docs/ANDROID_KEYSTORE_SETUP.md](docs/ANDROID_KEYSTORE_SETUP.md)
2. Create `android/key.properties` with your keystore info
3. Build again

**Output:** `build/app/outputs/flutter-apk/*.apk`

### iOS Release Build

```bash
# Quick method (unsigned)
./scripts/build-ios.sh release

# For App Store submission, use Xcode:
# 1. Open ios/Runner.xcworkspace
# 2. Product → Archive
# 3. Distribute → App Store Connect
```

**First time?** You need Apple Developer account and code signing:
1. Follow: [docs/IOS_CODE_SIGNING.md](docs/IOS_CODE_SIGNING.md)
2. Configure in Xcode
3. Build again

---

## Common Commands

```bash
# Development
flutter run                    # Run on connected device
flutter run --release          # Run release build (better performance)
flutter devices                # List connected devices

# Building
flutter build apk              # Build debug APK
flutter build apk --release    # Build release APK
flutter build appbundle        # Build Android App Bundle (for Play Store)
flutter build ios              # Build iOS app

# Testing & Analysis
flutter test                   # Run tests
flutter analyze                # Static analysis
flutter doctor                 # Check Flutter installation

# Maintenance
flutter clean                  # Clean build cache
flutter pub get                # Get dependencies
flutter upgrade                # Update Flutter SDK
```

---

## Project Structure

```
friday-voice-app/flutter/
├── lib/                  # Dart code (your app logic)
│   └── main.dart        # App entry point
├── android/             # Android native config
├── ios/                 # iOS native config
├── scripts/             # Build automation scripts
├── docs/                # Documentation
└── pubspec.yaml         # Dependencies & config
```

---

## Next Steps

### 1. Customize the App

**Update App Name:**
- Android: `android/app/src/main/AndroidManifest.xml` (android:label)
- iOS: `ios/Runner/Info.plist` (CFBundleDisplayName)

**Update Package Name/Bundle ID:**
- Android: `android/app/build.gradle` (applicationId)
- iOS: Xcode → Runner → General → Bundle Identifier

**Add App Icon:**
1. Create 1024x1024 PNG icon
2. Save to `assets/icon/friday-icon.png`
3. Run: `flutter pub run flutter_launcher_icons`
4. See: [docs/ICON_GENERATION_GUIDE.md](docs/ICON_GENERATION_GUIDE.md)

### 2. Add Dependencies

Edit `pubspec.yaml`:
```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # Add packages here
  http: ^1.1.2
  provider: ^6.1.1
```

Then run:
```bash
flutter pub get
```

### 3. Setup CI/CD

1. Push code to GitHub
2. Add secrets in repo settings (see [FLUTTER_NATIVE_BUILDS.md](FLUTTER_NATIVE_BUILDS.md#cicd-pipeline))
3. Workflow runs automatically on push

### 4. Prepare for App Stores

**Before submission:**
- [ ] Create privacy policy ([docs/PRIVACY_POLICY_TEMPLATE.md](docs/PRIVACY_POLICY_TEMPLATE.md))
- [ ] Prepare screenshots (see [docs/STORE_LISTING_GUIDE.md](docs/STORE_LISTING_GUIDE.md))
- [ ] Write app description ([docs/STORE_LISTING_TEMPLATE_EN.md](docs/STORE_LISTING_TEMPLATE_EN.md))
- [ ] Test on real devices
- [ ] Setup keystore (Android) or code signing (iOS)

**Guides:**
- [STORE_LISTING_GUIDE.md](docs/STORE_LISTING_GUIDE.md) - Complete submission guide
- [ANDROID_KEYSTORE_SETUP.md](docs/ANDROID_KEYSTORE_SETUP.md) - Android signing
- [IOS_CODE_SIGNING.md](docs/IOS_CODE_SIGNING.md) - iOS signing

---

## Troubleshooting

**Flutter command not found**
```bash
export PATH="$PATH:/path/to/flutter/bin"
# Add to ~/.zshrc or ~/.bashrc to make permanent
```

**App not showing on device**
- Check USB cable (try different one)
- Enable USB debugging (Android)
- Trust computer (iOS)
- Restart device

**Build fails**
```bash
flutter clean
flutter pub get
flutter doctor  # Fix any issues
flutter run
```

**Hot reload not working**
- Press `r` in terminal (hot reload)
- Press `R` in terminal (hot restart)
- Or restart `flutter run`

---

## Getting Help

**Documentation:**
- Main guide: [FLUTTER_NATIVE_BUILDS.md](FLUTTER_NATIVE_BUILDS.md)
- All docs: [docs/](docs/) folder

**Resources:**
- [Flutter Documentation](https://flutter.dev/docs)
- [Flutter Discord](https://discord.gg/flutter)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/flutter)

**Common Issues:**
- Check [FLUTTER_NATIVE_BUILDS.md - Troubleshooting](FLUTTER_NATIVE_BUILDS.md#troubleshooting)

---

## Quick Reference Card

| Task | Command |
|------|---------|
| Run app | `flutter run` |
| Build Android release | `./scripts/build-android.sh release` |
| Build iOS | `./scripts/build-ios.sh debug` |
| Run tests | `flutter test` |
| Clean build | `flutter clean` |
| Get dependencies | `flutter pub get` |
| Check setup | `flutter doctor` |
| List devices | `flutter devices` |

---

**Ready to build?** Start with `flutter run` and go from there! 🚀
