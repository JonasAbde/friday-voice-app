# iOS Code Signing Guide

This guide explains how to configure code signing for iOS builds of the Friday Voice App.

## Prerequisites

- macOS with Xcode installed (latest version recommended)
- Apple Developer account ($99/year for App Store distribution)
- Mac with Friday project downloaded

## Overview

iOS code signing requires:
1. **Apple ID / Developer Account**
2. **Certificates** (identifies you as a developer)
3. **Identifiers** (App ID / Bundle ID)
4. **Provisioning Profiles** (links certificates, App ID, and devices)

## Step 1: Join Apple Developer Program

1. Go to [developer.apple.com](https://developer.apple.com)
2. Sign in with your Apple ID
3. Enroll in Apple Developer Program ($99/year)
4. Wait for approval (usually 24-48 hours)

## Step 2: Open Project in Xcode

```bash
cd friday-voice-app/flutter/ios
open Runner.xcworkspace  # Note: .xcworkspace, NOT .xcodeproj
```

## Step 3: Configure Signing (Automatic - Recommended)

### In Xcode:

1. Select **Runner** project in left sidebar
2. Select **Runner** target
3. Go to **Signing & Capabilities** tab
4. Check **Automatically manage signing**
5. Select your **Team** from dropdown
6. Verify **Bundle Identifier**: `com.rendetalje.friday`

Xcode will automatically:
- Create certificates
- Register App ID
- Generate provisioning profiles

### Common Issues:

**"No signing certificate found"**
- Click "Add Account" in Xcode → Preferences → Accounts
- Sign in with Apple Developer account
- Click "Download Manual Profiles"

**"Bundle ID already registered"**
- Change Bundle ID to something unique (e.g., `com.yourname.friday`)
- Update in both Xcode and `Info.plist`

## Step 4: Configure Signing (Manual - Advanced)

### Create Certificates (developer.apple.com):

1. Go to Certificates, Identifiers & Profiles
2. Click **Certificates** → **+**
3. Select:
   - **iOS App Development** (for testing)
   - **iOS Distribution** (for App Store)
4. Follow CSR (Certificate Signing Request) instructions
5. Download and double-click to install in Keychain

### Register App ID:

1. Click **Identifiers** → **+**
2. Select **App IDs** → **Continue**
3. Fill in:
   - Description: "Friday Voice Assistant"
   - Bundle ID: `com.rendetalje.friday` (Explicit)
4. Enable capabilities:
   - **Audio, AirPlay, and Picture in Picture**
   - **Background Modes** → Audio
5. Click **Continue** → **Register**

### Create Provisioning Profiles:

1. Click **Profiles** → **+**
2. Select type:
   - **iOS App Development** (testing on devices)
   - **App Store** (for App Store submission)
3. Select App ID: `com.rendetalje.friday`
4. Select certificate (created earlier)
5. For Development: Select test devices
6. Name it: "Friday Development" / "Friday App Store"
7. Download and double-click to install

### Configure in Xcode:

1. Uncheck **Automatically manage signing**
2. Select **Provisioning Profile** for Debug and Release
3. Verify **Signing Certificate** is selected

## Step 5: Build and Test

### Build for Testing:

```bash
cd friday-voice-app/flutter
flutter build ios --debug --no-codesign
```

### Install on Device:

1. Connect iPhone/iPad via USB
2. Trust computer on device
3. In Xcode: Product → Destination → Your Device
4. Click **Run** (▶️) button
5. If "Untrusted Developer": Settings → General → VPN & Device Management → Trust

### Build for Release:

```bash
flutter build ios --release
```

Or use Xcode:
1. Product → Scheme → Runner
2. Product → Archive
3. Wait for archive to complete
4. Distribute App → App Store Connect

## Step 6: App Store Submission

### Prepare Assets:

- App icon (1024x1024 PNG, no transparency)
- Screenshots (see `STORE_LISTING_GUIDE.md`)
- Privacy policy URL
- App description (Danish + English)

### Create App in App Store Connect:

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - Platform: iOS
   - Name: Friday Voice Assistant
   - Primary Language: Danish / English
   - Bundle ID: com.rendetalje.friday
   - SKU: FRIDAY001 (unique identifier)
4. Click **Create**

### Upload Build:

1. In Xcode: Product → Archive
2. When complete: Click **Distribute App**
3. Select **App Store Connect** → **Upload**
4. Select signing options (automatic recommended)
5. Click **Upload**
6. Wait for processing (15-90 minutes)

### Submit for Review:

1. In App Store Connect: Select your app
2. Go to version (e.g., 1.0)
3. Fill in all required fields:
   - Screenshots
   - Description
   - Keywords
   - Support URL
   - Privacy Policy URL
4. Select build (uploaded from Xcode)
5. Answer App Privacy questions
6. Click **Submit for Review**

Review typically takes 1-3 days.

## Troubleshooting

### "Keychain permission denied"

```bash
security unlock-keychain ~/Library/Keychains/login.keychain-db
```

### "Profile doesn't include signing certificate"

- Download latest provisioning profiles in Xcode
- Or manually download from developer.apple.com

### "Unable to install on device"

- Device iOS version must match deployment target (iOS 12+)
- Check Bundle ID matches in Xcode and provisioning profile
- Trust certificate on device: Settings → General → VPN & Device Management

### "Code signing error: No certificate"

- Install certificate from developer.apple.com
- Double-click .cer file to add to Keychain
- Restart Xcode

## CI/CD Signing (Advanced)

For GitHub Actions or automated builds:

1. Export certificates and profiles:
   ```bash
   # Export certificate from Keychain
   # File → Export Items → .p12 format
   ```

2. Encode as base64:
   ```bash
   base64 -i certificate.p12 -o cert.b64
   base64 -i profile.mobileprovision -o profile.b64
   ```

3. Add as GitHub Secrets:
   - `IOS_CERTIFICATE_BASE64`
   - `IOS_CERTIFICATE_PASSWORD`
   - `IOS_PROVISION_PROFILE_BASE64`

4. Use fastlane for automation (optional)

## Security Best Practices

1. **Never commit certificates or private keys**
   - Already gitignored in .gitignore
   - Store in password manager

2. **Use separate certificates for different environments**
   - Development certificate for testing
   - Distribution certificate for App Store

3. **Revoke compromised certificates immediately**
   - developer.apple.com → Certificates → Revoke
   - Create new certificate

4. **Backup signing identities**
   - Keychain Access → Right-click certificate → Export
   - Store .p12 file securely with password

## Summary Checklist

- [ ] Apple Developer account active
- [ ] Project opened in Xcode
- [ ] Team selected in Signing & Capabilities
- [ ] Bundle ID configured: `com.rendetalje.friday`
- [ ] App ID registered in developer.apple.com
- [ ] Certificates created and installed
- [ ] Provisioning profiles downloaded
- [ ] Test build successful on device
- [ ] App created in App Store Connect
- [ ] Archive uploaded to App Store Connect
- [ ] All metadata filled in App Store Connect
- [ ] Submitted for review

Need help? Check [Apple's code signing guide](https://developer.apple.com/support/code-signing/).
