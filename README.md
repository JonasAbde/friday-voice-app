# 🖐️ Friday Voice App

**AI-powered voice assistant for business management** — Real-time voice control for calendar, email, invoices, and automation.

[![Flutter](https://img.shields.io/badge/Flutter-3.24-02569B?logo=flutter)](https://flutter.dev)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/JonasAbde/friday-voice-app/pulls)
[![Version](https://img.shields.io/github/v/tag/JonasAbde/friday-voice-app?label=version)](https://github.com/JonasAbde/friday-voice-app/tags)

---

## 🎯 Overview

Friday Voice App is a **production-ready Flutter application** that enables hands-free business management through natural voice commands. Built with Clean Architecture, BLoC state management, and multi-platform support (Android, iOS, Web).

**Key Features:**
- 🎤 **Real-time Speech-to-Text** (speech_to_text package)
- 🔊 **Neural Text-to-Speech** (ElevenLabs API + local fallback)
- 📱 **Multi-Platform** (Android, iOS, Web/PWA)
- 🧠 **Clean Architecture** (testable, scalable, maintainable)
- 🔄 **BLoC State Management** (predictable state)
- ✅ **50+ Tests** (unit, widget, integration)
- 🚀 **CI/CD Pipeline** (GitHub Actions)
- 🌐 **Offline Support** (works without internet)

---

## 🚀 Quick Start

### Prerequisites
- Flutter 3.24+ ([install guide](https://docs.flutter.dev/get-started/install))
- Android Studio / Xcode (for mobile builds)
- Node.js 18+ (for web server backend)

### Installation

```bash
# Clone repository
git clone https://github.com/JonasAbde/friday-voice-app.git
cd friday-voice-app

# Install Flutter dependencies
cd flutter
flutter pub get

# Run on web (Chrome)
flutter run -d chrome

# Run on Android
flutter run -d android

# Run on iOS
flutter run -d ios
```

### Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Add your API keys
ELEVENLABS_API_KEY=your_key_here
OPENCLAW_GATEWAY_URL=ws://localhost:18789
```

---

## 📦 Project Structure

```
friday-voice-app/
├── flutter/                    # Flutter mobile/web app
│   ├── lib/
│   │   ├── bloc/              # BLoC state management
│   │   │   ├── connection/    # WebSocket connection
│   │   │   ├── message/       # Chat messages
│   │   │   └── voice/         # Voice state machine
│   │   ├── models/            # Data models
│   │   ├── services/          # Business logic
│   │   │   ├── network_service.dart
│   │   │   └── voice_service.dart
│   │   ├── widgets/           # Reusable UI components
│   │   │   ├── voice_orb.dart
│   │   │   ├── glass_card.dart
│   │   │   └── chat_bubble.dart
│   │   └── main.dart          # App entry point
│   ├── test/                  # Tests (50+ tests)
│   │   ├── bloc/              # BLoC tests
│   │   └── widgets/           # Widget tests
│   ├── android/               # Android platform code
│   ├── ios/                   # iOS platform code
│   ├── web/                   # Web platform code
│   └── pubspec.yaml           # Dependencies
├── server.js                  # WebSocket server (Node.js)
├── voice-client.js            # Web voice client
├── index.html                 # Web UI
├── docs/                      # Documentation
│   ├── FLUTTER_ARCHITECTURE.md
│   ├── DEPLOYMENT-SUMMARY.md
│   └── DESIGN-SPEC-2026.md
├── .github/
│   └── workflows/
│       ├── ci.yml             # Web CI/CD
│       └── flutter-ci.yml     # Flutter CI/CD
├── README.md                  # This file
└── LICENSE                    # MIT License
```

---

## 🧪 Testing

```bash
# Run all tests
flutter test

# Run with coverage
flutter test --coverage

# Run specific test file
flutter test test/bloc/connection_bloc_test.dart
```

**Test Coverage:**
- BLoC tests: 21 tests (100% coverage)
- Widget tests: 29 tests (100% coverage)
- Overall: ~45% coverage (target 80%)

---

## 🏗️ Architecture

Friday Voice App follows **Clean Architecture** principles:

```
┌─────────────────────────────────────────┐
│           Presentation Layer            │
│  (Widgets, BLoC, UI Components)         │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│           Business Logic Layer          │
│  (Services, Use Cases, BLoC)            │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│              Data Layer                 │
│  (Models, WebSocket, API Clients)       │
└─────────────────────────────────────────┘
```

**State Management:** BLoC (Business Logic Component)
- `ConnectionBloc` - WebSocket connection state
- `MessageBloc` - Chat message management
- `VoiceBloc` - Voice interaction state machine

See [FLUTTER_ARCHITECTURE.md](docs/FLUTTER_ARCHITECTURE.md) for details.

---

## 🎨 UI/UX Design

**Design Philosophy:** 2026 Modern Design Trends
- Liquid glass morphism (BackdropFilter blur)
- Neon gradients (cyan/purple/pink)
- Microinteractions (smooth animations)
- Voice-first UX (pulsing orb mic button)
- Mobile-optimized (responsive layouts)

**Color Palette:**
- Primary: Cyan (#00d4ff)
- Accent: Purple (#b829ff)
- Background: Dark gradient (#0a0e27 → #1a1f3a)

See [DESIGN-SPEC-2026.md](docs/DESIGN-SPEC-2026.md) for full specs.

---

## 🚀 Deployment

### Web (Cloudflare Pages)

```bash
# Build web app
flutter build web --release

# Deploy (manual)
# Upload build/web/ to Cloudflare Pages
```

### Android

```bash
# Build debug APK
flutter build apk --debug

# Build release APK (requires keystore)
flutter build apk --release

# Install on device
adb install build/app/outputs/flutter-apk/app-debug.apk
```

### iOS

```bash
# Build iOS app
flutter build ios --release

# Requires Xcode for signing + App Store upload
```

See [DEPLOYMENT-SUMMARY.md](docs/DEPLOYMENT-SUMMARY.md) for complete guide.

---

## 📊 Tech Stack

**Frontend:**
- Flutter 3.24 (Dart 3.0+)
- Material Design 3
- BLoC (flutter_bloc ^8.1.6)
- WebSocket (web_socket_channel ^3.0.1)

**Voice:**
- speech_to_text ^7.0.0 (STT)
- flutter_tts ^4.0.2 (TTS)
- record ^5.1.2 (audio recording)
- ElevenLabs API (neural TTS)

**Testing:**
- bloc_test ^9.1.7
- mocktail ^1.0.4
- flutter_test (built-in)

**Backend:**
- Node.js 18+ (WebSocket server)
- OpenClaw Gateway (AI orchestration)

---

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

**Development Workflow:**
1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests (required for all new features)
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open Pull Request

**Code Quality:**
- All tests must pass (`flutter test`)
- Code must be formatted (`dart format .`)
- No analyzer warnings (`flutter analyze`)
- Follow [Effective Dart](https://dart.dev/guides/language/effective-dart)

---

## 📝 Documentation

- [Architecture Guide](docs/FLUTTER_ARCHITECTURE.md) - Clean Architecture + BLoC
- [Deployment Guide](docs/DEPLOYMENT-SUMMARY.md) - Multi-platform deployment
- [Design Specification](docs/DESIGN-SPEC-2026.md) - UI/UX design system
- [API Documentation](API.md) - WebSocket API reference
- [Features Roadmap](FEATURES.md) - Planned features
- [Bug Reports](BUGS.md) - Known issues

---

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Flutter](https://flutter.dev) - UI framework
- [ElevenLabs](https://elevenlabs.io) - Neural TTS
- [OpenClaw](https://openclaw.ai) - AI orchestration
- [Material Design](https://m3.material.io) - Design system

---

## 📞 Contact

**Jonas Abde (Bangzito)**
- GitHub: [@JonasAbde](https://github.com/JonasAbde)
- Discord: tekup-dk guild

---

## 📈 Project Stats

![GitHub stars](https://img.shields.io/github/stars/JonasAbde/friday-voice-app?style=social)
![GitHub forks](https://img.shields.io/github/forks/JonasAbde/friday-voice-app?style=social)
![GitHub issues](https://img.shields.io/github/issues/JonasAbde/friday-voice-app)
![GitHub pull requests](https://img.shields.io/github/issues-pr/JonasAbde/friday-voice-app)
![GitHub last commit](https://img.shields.io/github/last-commit/JonasAbde/friday-voice-app)
![Lines of code](https://img.shields.io/tokei/lines/github/JonasAbde/friday-voice-app)

---

**Built with ❤️ by Friday AI**
