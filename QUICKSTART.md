# Flutter Voice Integration - Quick Start

## Installation (3 minutes)

```bash
# 1. Create Flutter project
flutter create friday_voice_app
cd friday_voice_app

# 2. Add dependencies
flutter pub add speech_to_text flutter_tts record permission_handler

# 3. Copy VoiceService
# Download from: friday-voice-app/flutter/lib/services/voice_service.dart

# 4. Platform setup
```

### Android (1 minute)

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<manifest>
  <uses-permission android:name="android.permission.RECORD_AUDIO"/>
  <uses-permission android:name="android.permission.INTERNET"/>
  
  <queries>
    <intent>
      <action android:name="android.speech.RecognitionService" />
    </intent>
  </queries>
</manifest>
```

```gradle
// android/app/build.gradle
android {
    compileSdkVersion 35
    defaultConfig {
        minSdkVersion 23
    }
}
```

### iOS (1 minute)

```xml
<!-- ios/Runner/Info.plist -->
<dict>
  <key>NSMicrophoneUsageDescription</key>
  <string>App needs microphone for voice commands</string>
  
  <key>NSSpeechRecognitionUsageDescription</key>
  <string>App needs speech recognition for voice commands</string>
</dict>
```

## Basic Usage (5 minutes)

```dart
import 'package:friday/services/voice_service.dart';

class MyApp extends StatefulWidget {
  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  final voiceService = VoiceService();
  String transcript = '';
  
  @override
  void initState() {
    super.initState();
    _initVoice();
  }
  
  Future<void> _initVoice() async {
    await voiceService.initialize(
      locale: 'da-DK', // or 'en-US'
      onTranscription: (text) => setState(() => transcript = text),
      onError: (error) => print(error),
    );
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          if (voiceService.isListening) {
            await voiceService.stopListening();
          } else {
            await voiceService.startListening();
          }
          setState(() {});
        },
        child: Icon(
          voiceService.isListening ? Icons.mic : Icons.mic_none,
        ),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(transcript, style: TextStyle(fontSize: 24)),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => voiceService.speak('Hej!'),
              child: Text('Speak'),
            ),
          ],
        ),
      ),
    );
  }
  
  @override
  void dispose() {
    voiceService.dispose();
    super.dispose();
  }
}
```

## ElevenLabs Setup (Optional, 10 minutes)

### 1. Get API Key

1. Sign up at [elevenlabs.io](https://elevenlabs.io)
2. Profile → API Keys → Create
3. Copy key

### 2. Add Platform Implementations

**Android**: Copy `ElevenLabsPlugin.kt` to `android/app/src/main/kotlin/com/friday/voice/`

**iOS**: Copy `ElevenLabsPlugin.swift` to `ios/Runner/`

**Web**: Copy `elevenlabs_plugin.js` to `web/` and add to `index.html`

### 3. Use in App

```dart
await voiceService.initialize(
  elevenLabsApiKey: 'your_api_key_here',
  elevenLabsVoiceId: 'voice_id_here',
  useElevenLabs: true,
);

// Speaks with ElevenLabs, falls back to local TTS on error
await voiceService.speak('Hello from ElevenLabs!');
```

## Common Tasks

### Listen for Speech

```dart
await voiceService.startListening();
// User speaks...
await voiceService.stopListening();
```

### Speak Text

```dart
await voiceService.speak('Hello world!');
```

### Record Audio

```dart
await voiceService.startRecording();
await Future.delayed(Duration(seconds: 5));
final path = await voiceService.stopRecording();
print('Saved to: $path');
```

### Change Language

```dart
// Get available languages
final locales = await voiceService.getAvailableLocales();

// Switch language
await voiceService.initialize(locale: 'en-US');
```

### Get Voices

```dart
final voices = await voiceService.getAvailableVoices();
for (final voice in voices) {
  print(voice['name']);
}
```

## Testing

```bash
# Run on Android
flutter run -d android

# Run on iOS
flutter run -d ios

# Run on Web (Chrome required)
flutter run -d chrome

# Run tests
flutter test
```

## Troubleshooting

### Android: "Speech recognition unavailable"
→ Enable Google app in settings

### iOS: App crashes on permission request
→ Test on physical device (simulator bug)

### Web: No speech recognition
→ Use Chrome or Edge (Firefox/Brave limited)

### All: "Permission denied"
→ Check manifest/Info.plist permissions

## Performance Tips

✅ **Initialize once**: Don't create multiple VoiceService instances
✅ **Dispose properly**: Call `dispose()` when done
✅ **Handle errors**: Always implement `onError` callback
✅ **Set timeouts**: Use `listenTimeout` and `pauseTimeout`
✅ **Test offline**: Ensure local TTS fallback works

## Package Comparison

| Feature | speech_to_text | flutter_tts | record |
|---------|---------------|-------------|---------|
| Platforms | 6 | 5 | 6 |
| Offline | ✅ | ✅ | ✅ |
| Latency | <500ms | <200ms | <500ms |
| Size | 50KB | 30KB | 50KB |

## Resources

📖 [Full Documentation](./FLUTTER_VOICE_INTEGRATION.md)
🎯 [VoiceService API](./friday-voice-app/flutter/lib/services/voice_service.dart)
💻 [Example App](./friday-voice-app/flutter/example/)
🐛 [Issues](https://github.com/jonasabde/friday-voice-app/issues)

---

**Total Setup Time**: ~15 minutes
**Platforms Supported**: Android, iOS, Web
**Offline Support**: ✅ Yes
