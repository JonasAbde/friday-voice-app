# Android Keystore Setup Guide

This guide explains how to create and configure an Android keystore for signing release builds of the Friday Voice App.

## Prerequisites

- Java JDK installed
- Android Studio (optional, but recommended)

## Step 1: Create Keystore

Open terminal and run:

```bash
keytool -genkey -v -keystore friday-release.keystore \
  -alias friday-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

You'll be prompted for:
- **Keystore password**: Choose a strong password (save it!)
- **Key password**: Can be same as keystore password
- **Your name**: Your/company name
- **Organization**: Rendetalje or your company name
- **City, State, Country**: Your location

**IMPORTANT**: Store the keystore file and passwords securely. You'll need them for every release build, and you **cannot** update your app in Play Store without the original keystore.

## Step 2: Store Keystore Securely

Move the keystore to a secure location:

```bash
# Store in project (gitignored)
mkdir -p android/app/
mv friday-release.keystore android/app/

# OR store outside project (recommended for shared systems)
mv friday-release.keystore ~/keystores/
```

## Step 3: Create key.properties

Create `android/key.properties` (this file is gitignored):

```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=friday-key
storeFile=/path/to/friday-release.keystore
```

**If keystore is in android/app/:**
```properties
storeFile=release.keystore
```

**If keystore is elsewhere:**
```properties
storeFile=/Users/yourname/keystores/friday-release.keystore
```

## Step 4: Verify Configuration

Build a release APK to test:

```bash
cd friday-voice-app/flutter
./scripts/build-android.sh release
```

If successful, you'll see signed APKs in `build/app/outputs/flutter-apk/`.

## Step 5: Backup Keystore

**CRITICAL**: Make multiple backups of:
1. The keystore file (`friday-release.keystore`)
2. The passwords
3. The alias name

Store backups in:
- Password manager (1Password, LastPass, etc.)
- Encrypted cloud storage (Dropbox, Google Drive with encryption)
- Physical USB drive in a safe location

**Why this matters:**
If you lose the keystore, you **cannot** update your app in Google Play Store. You'll need to publish a completely new app with a new package name.

## CI/CD Setup (GitHub Actions)

For automated builds, store keystore and credentials as GitHub Secrets:

1. Encode keystore to base64:
   ```bash
   base64 -i friday-release.keystore -o keystore.b64
   ```

2. Add secrets in GitHub repo settings:
   - `ANDROID_KEYSTORE_BASE64`: Content of keystore.b64
   - `ANDROID_KEYSTORE_PASSWORD`: Keystore password
   - `ANDROID_KEY_PASSWORD`: Key password
   - `ANDROID_KEY_ALIAS`: friday-key

## Troubleshooting

### "Key was created with errors"
- Make sure you're using the same password for both keystore and key
- Try again with simpler passwords (no special characters)

### "Could not find or load main class"
- Install Java JDK: `brew install openjdk@17` (macOS)
- Set JAVA_HOME environment variable

### "Keystore file does not exist"
- Check path in key.properties
- Use absolute path if relative path doesn't work
- Make sure keystore file is named exactly as in key.properties

## Security Best Practices

1. **Never commit keystore or key.properties to git**
   - Already gitignored in .gitignore
   - Double-check before pushing

2. **Use different keystores for debug and release**
   - Debug builds use auto-generated debug keystore
   - Release builds use your production keystore

3. **Rotate passwords regularly** (every 1-2 years)
   - Create new keystore
   - Publish new major version

4. **Limit access**
   - Only trusted team members should have keystore access
   - Use CI/CD secrets for automated builds

## Play Store Upload Signing (Optional)

Google Play offers app signing where Google manages your signing key:

1. Upload your app with your upload key (this keystore)
2. Google signs with their key before distribution
3. If you lose your upload key, Google can reset it

This is recommended for extra security. Enable in Play Console → Setup → App integrity.
