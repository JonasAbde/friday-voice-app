# Contributing to Friday Voice App

First off, thank you for considering contributing to Friday Voice App! 🎉

The following is a set of guidelines for contributing. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

---

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [How Can I Contribute?](#how-can-i-contribute)
3. [Development Setup](#development-setup)
4. [Coding Standards](#coding-standards)
5. [Testing Requirements](#testing-requirements)
6. [Pull Request Process](#pull-request-process)
7. [Commit Message Guidelines](#commit-message-guidelines)

---

## 📜 Code of Conduct

This project adheres to a simple code of conduct:
- **Be respectful** - No harassment, discrimination, or offensive language
- **Be constructive** - Provide helpful feedback, not just criticism
- **Be collaborative** - Work together, share knowledge

---

## 🤝 How Can I Contribute?

### Reporting Bugs

**Before submitting a bug report:**
- Check the [existing issues](https://github.com/JonasAbde/friday-voice-app/issues) to avoid duplicates
- Test on the latest version (bugs may already be fixed)

**When submitting a bug report:**
- Use the bug report template
- Include OS, Flutter version, and device info
- Provide steps to reproduce
- Include screenshots/logs if applicable
- Describe expected vs actual behavior

**Example:**
```markdown
**Environment:**
- OS: Android 14
- Flutter: 3.24.1
- Device: Pixel 7

**Steps to Reproduce:**
1. Open app
2. Tap voice button
3. Speak "check calendar"

**Expected:** Transcription appears
**Actual:** App crashes

**Logs:**
[paste error logs]
```

### Suggesting Features

**Before suggesting a feature:**
- Check [FEATURES.md](FEATURES.md) for planned features
- Search existing feature requests

**When suggesting a feature:**
- Use the feature request template
- Explain the use case (why is it needed?)
- Describe the proposed solution
- Consider implementation complexity
- Provide mockups/examples if applicable

### Code Contributions

**Good first issues:**
- Look for issues labeled `good first issue` or `help wanted`
- Documentation improvements
- UI polish (animations, colors, layouts)
- Test coverage improvements

**Advanced contributions:**
- New voice commands
- Platform integrations (Google Calendar, Gmail)
- Performance optimizations
- Architecture improvements

---

## 🛠️ Development Setup

### Prerequisites

```bash
# Flutter SDK (3.24+)
flutter --version

# Node.js (18+)
node --version

# Git
git --version
```

### Fork & Clone

```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/friday-voice-app.git
cd friday-voice-app

# Add upstream remote
git remote add upstream https://github.com/JonasAbde/friday-voice-app.git
```

### Install Dependencies

```bash
# Flutter dependencies
cd flutter
flutter pub get

# Node dependencies (for web server)
cd ..
npm install
```

### Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Add your API keys (optional for development)
# ElevenLabs API key only needed for neural TTS
```

### Run Development Server

```bash
# Web (fastest for development)
cd flutter
flutter run -d chrome

# Android emulator
flutter run -d emulator-5554

# iOS simulator
flutter run -d iPhone
```

---

## 📏 Coding Standards

### Dart Code Style

**Follow [Effective Dart](https://dart.dev/guides/language/effective-dart):**
- Use `lowerCamelCase` for variables, functions
- Use `UpperCamelCase` for classes, enums
- Prefer `final` over `var` when possible
- Use trailing commas for multi-line arguments

**Example:**
```dart
// ✅ Good
final userName = 'Jonas';
const maxRetries = 3;

class VoiceService {
  Future<String> transcribeAudio(File audioFile) async {
    // implementation
  }
}

// ❌ Bad
var user_name = 'Jonas';  // Wrong case
MAX_RETRIES = 3;          // Should be const
```

### File Organization

```
lib/
├── bloc/           # State management (BLoC)
├── models/         # Data models
├── services/       # Business logic
├── widgets/        # Reusable UI components
├── screens/        # Full-screen views
├── utils/          # Helper functions
└── main.dart       # Entry point
```

### Code Documentation

**Use dartdoc comments for public APIs:**
```dart
/// Transcribes audio to text using speech-to-text.
///
/// Returns a [Future] that completes with the transcribed text,
/// or throws a [VoiceException] if transcription fails.
///
/// Example:
/// ```dart
/// final text = await voiceService.transcribe(audioFile);
/// print(text); // "Hello Friday"
/// ```
Future<String> transcribe(File audio) async {
  // implementation
}
```

### State Management

**Use BLoC pattern:**
- Events: User actions (`StartListening`, `StopListening`)
- States: UI state (`VoiceState.listening`, `VoiceState.idle`)
- BLoC: Business logic (`VoiceBloc` handles events → states)

**Example:**
```dart
// Event
class StartListening extends VoiceEvent {}

// State
class VoiceState {
  final bool isListening;
  VoiceState({required this.isListening});
}

// BLoC
class VoiceBloc extends Bloc<VoiceEvent, VoiceState> {
  VoiceBloc() : super(VoiceState(isListening: false)) {
    on<StartListening>(_onStartListening);
  }
  
  void _onStartListening(StartListening event, Emitter<VoiceState> emit) {
    emit(VoiceState(isListening: true));
  }
}
```

---

## ✅ Testing Requirements

**All new features MUST include tests.**

### Unit Tests (BLoC, Services)

```bash
# Run all tests
flutter test

# Run specific test
flutter test test/bloc/voice_bloc_test.dart
```

**Example BLoC test:**
```dart
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('VoiceBloc', () {
    blocTest<VoiceBloc, VoiceState>(
      'emits listening state when StartListening is added',
      build: () => VoiceBloc(),
      act: (bloc) => bloc.add(const StartListening()),
      expect: () => [VoiceState(isListening: true)],
    );
  });
}
```

### Widget Tests

**Example widget test:**
```dart
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('VoiceOrb renders correctly', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: VoiceOrb(state: VoiceState.idle),
      ),
    );
    
    expect(find.byType(VoiceOrb), findsOneWidget);
  });
}
```

### Coverage Requirements

- **Minimum:** 70% overall coverage
- **BLoCs:** 100% coverage (state transitions critical)
- **Widgets:** 80% coverage (UI less critical)

```bash
# Generate coverage report
flutter test --coverage
genhtml coverage/lcov.info -o coverage/html
open coverage/html/index.html
```

---

## 🔄 Pull Request Process

### 1. Create Feature Branch

```bash
# Update main branch
git checkout master
git pull upstream master

# Create feature branch
git checkout -b feature/voice-command-shortcuts
```

### 2. Make Changes

```bash
# Write code + tests
# ...

# Format code
dart format .

# Analyze code
flutter analyze

# Run tests
flutter test
```

### 3. Commit Changes

```bash
# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat: Add voice command shortcuts

- Add 5 quick voice shortcuts (calendar, email, etc)
- Update VoiceService to handle shortcuts
- Add tests for shortcut handling
"
```

### 4. Push & Create PR

```bash
# Push to your fork
git push origin feature/voice-command-shortcuts

# Create PR on GitHub
# Use PR template, fill out checklist
```

### 5. PR Checklist

**Before submitting PR:**
- [ ] All tests passing (`flutter test`)
- [ ] Code formatted (`dart format .`)
- [ ] No analyzer warnings (`flutter analyze`)
- [ ] Coverage ≥70% (check with `flutter test --coverage`)
- [ ] Documentation updated (if applicable)
- [ ] CHANGELOG.md updated (for features/fixes)
- [ ] Screenshots included (for UI changes)

### 6. Code Review

- Respond to feedback within 48 hours
- Make requested changes
- Push updates to same branch (PR auto-updates)
- Once approved, maintainer will merge

---

## 📝 Commit Message Guidelines

**Use [Conventional Commits](https://www.conventionalcommits.org/):**

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, no logic change)
- `refactor`: Code change (no new feature or bug fix)
- `perf`: Performance improvement
- `test`: Add/update tests
- `chore`: Build process, dependencies

### Examples

**Feature:**
```
feat(voice): Add wake word detection

- Integrate Picovoice Porcupine
- Custom "Friday" wake word trained
- Update VoiceService to listen for wake word
```

**Bug fix:**
```
fix(ui): Voice orb animation stuttering on Android

Fixed animation frame drops by using vsync.
Tested on Pixel 7 (Android 14).

Closes #42
```

**Documentation:**
```
docs: Update README with deployment guide

Added section for Cloudflare Pages deployment.
```

---

## 🎓 Learning Resources

**Flutter:**
- [Flutter docs](https://docs.flutter.dev)
- [Effective Dart](https://dart.dev/guides/language/effective-dart)
- [Flutter BLoC docs](https://bloclibrary.dev)

**This Project:**
- [Architecture Guide](docs/FLUTTER_ARCHITECTURE.md)
- [Design System](docs/DESIGN-SPEC-2026.md)
- [API Reference](API.md)

---

## 💬 Questions?

- Open a [GitHub Discussion](https://github.com/JonasAbde/friday-voice-app/discussions)
- Join Discord: tekup-dk guild
- DM: @bangzito (Discord)

---

**Thank you for contributing! 🖐️**
