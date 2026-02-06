# App Icon Generation Guide

Quick guide to generating all required app icons for Android and iOS.

## Option 1: Automated (Recommended)

### Using flutter_launcher_icons

**Step 1: Add to pubspec.yaml**

```yaml
dev_dependencies:
  flutter_launcher_icons: "^0.13.1"

flutter_launcher_icons:
  android: true
  ios: true
  image_path: "assets/icon/friday-icon.png"
  
  # Android adaptive icons
  adaptive_icon_foreground: "assets/icon/friday-foreground.png"
  adaptive_icon_background: "#FFFFFF"  # or path to background image
  
  # Minimum/round icons
  min_sdk_android: 21
  
  # Remove alpha channel (required for iOS)
  remove_alpha_ios: true
```

**Step 2: Prepare source image**

Create high-resolution icon:
- Size: 1024x1024 pixels minimum
- Format: PNG
- Content: Centered logo with padding
- Avoid: Text (will be unreadable at small sizes)
- Path: `assets/icon/friday-icon.png`

**For Android adaptive icons (optional):**
- Foreground: Logo only (transparent background)
- Background: Solid color or pattern
- Safe area: Keep important content in center 66% (684x684 circle)

**Step 3: Generate icons**

```bash
flutter pub get
flutter pub run flutter_launcher_icons
```

This automatically creates:
- **Android:** All mipmap sizes (mdpi to xxxhdpi)
- **iOS:** All required sizes (20x20 to 1024x1024)

---

## Option 2: Online Tools

### appicon.co (Recommended)

1. Go to [appicon.co](https://www.appicon.co/)
2. Upload 1024x1024 PNG
3. Select platforms (iOS, Android)
4. Download generated icons
5. Extract and place in project:
   - Android: `android/app/src/main/res/mipmap-*/`
   - iOS: `ios/Runner/Assets.xcassets/AppIcon.appiconset/`

### Other Tools

- [App Icon Generator](https://www.appicon.co/)
- [Make App Icon](https://makeappicon.com/)
- [Icon Kitchen](https://icon.kitchen/)
- [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html) (Android only)

---

## Option 3: Manual Creation

### Photoshop/Figma/Sketch

**Android sizes (place in android/app/src/main/res/):**

| Folder         | Size      | Filename           |
|----------------|-----------|-------------------|
| mipmap-mdpi    | 48x48     | ic_launcher.png   |
| mipmap-hdpi    | 72x72     | ic_launcher.png   |
| mipmap-xhdpi   | 96x96     | ic_launcher.png   |
| mipmap-xxhdpi  | 144x144   | ic_launcher.png   |
| mipmap-xxxhdpi | 192x192   | ic_launcher.png   |

**Adaptive icons (optional):**
Add `ic_launcher_foreground.png` and `ic_launcher_background.png` in each folder.

**iOS sizes (place in ios/Runner/Assets.xcassets/AppIcon.appiconset/):**

| Filename                      | Size        | Scale | Device        |
|-------------------------------|-------------|-------|---------------|
| Icon-App-20x20@1x.png         | 20x20       | 1x    | iPad          |
| Icon-App-20x20@2x.png         | 40x40       | 2x    | iPhone/iPad   |
| Icon-App-20x20@3x.png         | 60x60       | 3x    | iPhone        |
| Icon-App-29x29@1x.png         | 29x29       | 1x    | iPad          |
| Icon-App-29x29@2x.png         | 58x58       | 2x    | iPhone/iPad   |
| Icon-App-29x29@3x.png         | 87x87       | 3x    | iPhone        |
| Icon-App-40x40@1x.png         | 40x40       | 1x    | iPad          |
| Icon-App-40x40@2x.png         | 80x80       | 2x    | iPhone/iPad   |
| Icon-App-40x40@3x.png         | 120x120     | 3x    | iPhone        |
| Icon-App-60x60@2x.png         | 120x120     | 2x    | iPhone        |
| Icon-App-60x60@3x.png         | 180x180     | 3x    | iPhone        |
| Icon-App-76x76@1x.png         | 76x76       | 1x    | iPad          |
| Icon-App-76x76@2x.png         | 152x152     | 2x    | iPad          |
| Icon-App-83.5x83.5@2x.png     | 167x167     | 2x    | iPad Pro      |
| Icon-App-1024x1024@1x.png     | 1024x1024   | 1x    | App Store     |

**Batch script for ImageMagick:**

```bash
#!/bin/bash
# Requires ImageMagick: brew install imagemagick

SOURCE="friday-icon-1024.png"

# Android
convert "$SOURCE" -resize 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher.png
convert "$SOURCE" -resize 72x72 android/app/src/main/res/mipmap-hdpi/ic_launcher.png
convert "$SOURCE" -resize 96x96 android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
convert "$SOURCE" -resize 144x144 android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
convert "$SOURCE" -resize 192x192 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png

# iOS (example for a few sizes)
convert "$SOURCE" -resize 20x20 ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@1x.png
convert "$SOURCE" -resize 40x40 ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-20x20@2x.png
# ... (continue for all sizes)

echo "Icons generated!"
```

---

## Design Guidelines

### Android

**Material Design:**
- Use adaptive icons (separate foreground/background)
- Foreground: Logo on transparent background
- Background: Solid color or subtle pattern
- Safe zone: Keep logo in center 66% (masking varies by device)
- No shadows in icon itself (system adds)

**Testing:**
```bash
# Preview adaptive icon in different shapes
# Use Android Studio → Image Asset tool → Preview
```

### iOS

**Human Interface Guidelines:**
- Simple, recognizable shape
- No transparency (fill with solid color if needed)
- No rounded corners (iOS adds automatically)
- Centered composition
- Consistent visual weight
- Test at small sizes (20x20)

**Common mistakes:**
- ❌ Too detailed (illegible at small sizes)
- ❌ Text in icon (unreadable)
- ❌ Transparency (causes black background on iOS)
- ❌ Rounded corners (will be double-rounded)

### Friday Branding

**Suggested design:**
- Color: Professional blue (#2196F3) or Friday green (#4CAF50)
- Icon: Stylized "F" or microphone/waveform symbol
- Style: Modern, minimal, flat design
- Padding: 10-15% margin from edges

**Example concepts:**
1. Bold "F" with voice waveform
2. Microphone icon with circular background
3. Speech bubble with "F"
4. Abstract AI assistant symbol

---

## Verification

### Android

1. Check files exist:
   ```bash
   ls android/app/src/main/res/mipmap-*dpi/ic_launcher.png
   ```

2. Build and check on device:
   ```bash
   flutter run
   # Check home screen icon appearance
   ```

3. Test adaptive icon (if using):
   - Long press icon on launcher
   - Try different launchers (Samsung, Pixel, etc.)

### iOS

1. Check files exist:
   ```bash
   ls ios/Runner/Assets.xcassets/AppIcon.appiconset/*.png
   ```

2. Open in Xcode:
   ```bash
   open ios/Runner.xcworkspace
   ```
   - Runner → Assets.xcassets → AppIcon
   - Verify all slots filled (no yellow warnings)

3. Build and check:
   ```bash
   flutter run -d <ios-device>
   # Check home screen icon
   ```

---

## Troubleshooting

**"Icon not updating after change"**
```bash
# Android
flutter clean
flutter run

# iOS
rm -rf ios/Pods
rm ios/Podfile.lock
pod install --repo-update
flutter run
```

**"iOS icon has black background"**
- Icon has transparency
- Use `remove_alpha_ios: true` in flutter_launcher_icons
- Or manually remove alpha channel in image editor

**"Adaptive icon looks cut off"**
- Logo extends beyond safe zone (center 66%)
- Redesign with more padding
- Test in Android Studio preview tool

**"Xcode shows missing icons"**
- Check Contents.json matches actual files
- Regenerate with flutter_launcher_icons
- Or use Xcode asset catalog to reimport

---

## Store Icon (1024x1024)

For Google Play and App Store:

**Requirements:**
- Exactly 1024x1024 pixels
- PNG format (24-bit RGB, no alpha for iOS)
- No rounded corners
- No device frames
- High quality, no pixelation

**Differences from app icon:**
- Can include subtle effects (gradients, shadows)
- More detail allowed (viewed at larger size)
- Marketing focus (attractive in store listings)

**Export settings:**
- PNG-24 (Photoshop/Figma)
- sRGB color profile
- No compression artifacts

---

**Quick Start:**

```bash
# 1. Create icon in Figma/Photoshop (1024x1024)
# 2. Save as assets/icon/friday-icon.png
# 3. Add flutter_launcher_icons to pubspec.yaml
# 4. Run:
flutter pub get
flutter pub run flutter_launcher_icons
flutter clean
flutter run
```

Done! Icons deployed to Android and iOS.
