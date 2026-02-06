/// Voice recognition states
enum VoiceState {
  /// Idle, waiting for user input
  idle,
  
  /// Actively listening to user's voice
  listening,
  
  /// Processing user's input (AI thinking)
  processing,
  
  /// Speaking response back to user
  speaking,
}

/// Extension for display strings
extension VoiceStateExtension on VoiceState {
  String get displayName {
    switch (this) {
      case VoiceState.idle:
        return 'Klar';
      case VoiceState.listening:
        return 'Lytter...';
      case VoiceState.processing:
        return 'Tænker...';
      case VoiceState.speaking:
        return 'Taler...';
    }
  }
  
  /// Icon for current state
  String get icon {
    switch (this) {
      case VoiceState.idle:
        return '🎙️';
      case VoiceState.listening:
        return '🔵';
      case VoiceState.processing:
        return '🟣';
      case VoiceState.speaking:
        return '🔊';
    }
  }
}
