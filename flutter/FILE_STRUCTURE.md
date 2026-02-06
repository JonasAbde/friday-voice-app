# Friday Voice App - Complete File Structure

```
friday-voice-app/flutter/
│
├── FLUTTER_NATIVE_BUILDS.md           # 📚 Main documentation
├── QUICKSTART.md                       # 🚀 Quick start guide
├── pubspec.yaml                        # 📦 Dependencies & config
├── .gitignore                          # 🔒 Git ignore rules
│
├── android/                            # 🤖 ANDROID CONFIGURATION
│   ├── app/
│   │   ├── build.gradle               # ⚙️  App-level build config
│   │   │                               #    - Min SDK: 21, Target SDK: 34
│   │   │                               #    - Signing config
│   │   │                               #    - ProGuard optimization
│   │   ├── proguard-rules.pro         # 🔐 Code obfuscation rules
│   │   └── src/main/
│   │       ├── AndroidManifest.xml    # 📋 App config & permissions
│   │       │                           #    - RECORD_AUDIO, INTERNET, WAKE_LOCK
│   │       ├── kotlin/com/rendetalje/friday/
│   │       │   └── MainActivity.kt    # 📱 Main activity entry point
│   │       └── res/
│   │           ├── drawable/
│   │           │   └── launch_background.xml  # 🎨 Splash screen
│   │           ├── values/
│   │           │   └── styles.xml     # 🎨 App themes
│   │           └── mipmap-*dpi/       # 🖼️  App icons (5 sizes)
│   │               └── ic_launcher.png
│   ├── build.gradle                   # 🏗️  Project-level build config
│   ├── gradle.properties              # ⚡ Gradle optimization settings
│   └── key.properties                 # 🔑 [GITIGNORED] Signing keys
│
├── ios/                                # 🍎 iOS CONFIGURATION
│   ├── Runner/
│   │   ├── Info.plist                 # 📋 App config & permissions
│   │   │                               #    - NSMicrophoneUsageDescription
│   │   │                               #    - Background modes (audio)
│   │   ├── AppDelegate.swift          # 📱 App lifecycle handler
│   │   └── Assets.xcassets/
│   │       └── AppIcon.appiconset/    # 🖼️  App icons (18 sizes)
│   │           ├── Contents.json      #    Icon metadata
│   │           └── Icon-App-*.png     #    All required sizes
│   ├── Podfile                        # 📦 CocoaPods dependencies
│   ├── Runner.xcodeproj/              # 🏗️  Xcode project config
│   └── Runner.xcworkspace/            # 💼 Xcode workspace (use this!)
│
├── scripts/                            # 🔧 BUILD AUTOMATION
│   ├── build-android.sh               # 🤖 Android build script
│   │                                   #    - Debug/release builds
│   │                                   #    - APK splitting by architecture
│   │                                   #    - Size verification
│   └── build-ios.sh                   # 🍎 iOS build script
│                                       #    - macOS/Xcode checks
│                                       #    - CocoaPods installation
│                                       #    - Unsigned builds for CI
│
├── docs/                               # 📚 DOCUMENTATION
│   ├── ANDROID_KEYSTORE_SETUP.md      # 🔑 Android signing guide
│   │                                   #    - Keystore creation
│   │                                   #    - key.properties setup
│   │                                   #    - Backup procedures
│   ├── IOS_CODE_SIGNING.md            # 🔑 iOS code signing guide
│   │                                   #    - Apple Developer setup
│   │                                   #    - Certificates & profiles
│   │                                   #    - Xcode configuration
│   ├── STORE_LISTING_GUIDE.md         # 📱 App store submission guide
│   │                                   #    - Screenshot requirements
│   │                                   #    - Asset specifications
│   │                                   #    - Review checklist
│   ├── STORE_LISTING_TEMPLATE_EN.md   # 🇬🇧 English store listing
│   ├── STORE_LISTING_TEMPLATE_DA.md   # 🇩🇰 Danish store listing
│   ├── PRIVACY_POLICY_TEMPLATE.md     # 🔒 Privacy policy template
│   │                                   #    - GDPR compliant
│   │                                   #    - CCPA compliant
│   └── ICON_GENERATION_GUIDE.md       # 🎨 Icon creation guide
│                                       #    - Automated generation
│                                       #    - Manual creation
│                                       #    - Design guidelines
│
├── .github/workflows/                  # ⚙️  CI/CD CONFIGURATION
│   └── build.yml                      # 🔄 GitHub Actions workflow
│                                       #    - Test & lint
│                                       #    - Android debug/release builds
│                                       #    - iOS builds
│                                       #    - Artifact uploads
│
├── lib/                                # 💻 FLUTTER/DART CODE
│   └── main.dart                      # 🚪 App entry point
│
├── test/                               # 🧪 TESTS
│   └── widget_test.dart               # Test files
│
└── assets/                             # 📁 ASSETS (create if needed)
    ├── images/                         # 🖼️  Images
    ├── sounds/                         # 🔊 Audio files
    └── icon/                           # 🎨 Source app icon
        ├── friday-icon.png            #    1024x1024 main icon
        └── friday-foreground.png      #    Adaptive icon foreground

```

## File Counts & Sizes

**Configuration files:** 15+
**Documentation files:** 10
**Build scripts:** 2
**Platform-specific:**
- Android: ~10 core files + resources
- iOS: ~8 core files + icon assets

**Total structure:** ~50-60 files (before dependencies)

## Key Files Explained

### Must Configure

| File | Purpose | Action Required |
|------|---------|-----------------|
| `android/app/build.gradle` | Android build config | ✅ Pre-configured |
| `android/app/src/main/AndroidManifest.xml` | Permissions | ✅ Pre-configured |
| `ios/Runner/Info.plist` | iOS permissions | ✅ Pre-configured |
| `ios/Podfile` | iOS dependencies | ✅ Pre-configured |
| `pubspec.yaml` | Flutter dependencies | ⚠️  Add your packages |
| `android/key.properties` | Android signing | ❌ Create manually |

### Documentation

| File | What It Covers |
|------|----------------|
| `FLUTTER_NATIVE_BUILDS.md` | Complete build guide (17,000+ words) |
| `QUICKSTART.md` | 5-minute setup guide |
| `docs/ANDROID_KEYSTORE_SETUP.md` | Android signing step-by-step |
| `docs/IOS_CODE_SIGNING.md` | iOS signing step-by-step |
| `docs/STORE_LISTING_GUIDE.md` | App store submission |
| `docs/PRIVACY_POLICY_TEMPLATE.md` | Legal compliance |

### Build Automation

| File | Purpose |
|------|---------|
| `scripts/build-android.sh` | Android builds (debug/release) |
| `scripts/build-ios.sh` | iOS builds (debug/release) |
| `.github/workflows/build.yml` | CI/CD pipeline |

## What's Gitignored

```
# Build artifacts
build/
*.apk, *.ipa, *.aab

# Secrets
android/key.properties
*.keystore, *.jks
*.env
secrets.json

# Dependencies
android/.gradle/
ios/Pods/
.dart_tool/

# IDE
.idea/, .vscode/
*.iml
```

## Next Steps

1. **Review main docs:** [FLUTTER_NATIVE_BUILDS.md](FLUTTER_NATIVE_BUILDS.md)
2. **Quick start:** [QUICKSTART.md](QUICKSTART.md)
3. **Add dependencies:** Edit `pubspec.yaml`
4. **Create app icon:** See [docs/ICON_GENERATION_GUIDE.md](docs/ICON_GENERATION_GUIDE.md)
5. **Setup signing:** See keystore/code signing docs
6. **Build & test:** `flutter run`

---

**All files are ready to use!** 🎉 Just add your Dart code in `lib/` and you're good to go.
