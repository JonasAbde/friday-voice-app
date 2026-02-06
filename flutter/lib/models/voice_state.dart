import 'package:equatable/equatable.dart';

/// Voice status enum
enum VoiceStatus {
  /// Idle, waiting for user input
  idle,
  
  /// Actively listening to user's voice
  listening,
  
  /// Processing user's input (AI thinking)
  processing,
  
  /// Speaking response back to user
  speaking,
  
  /// Error state
  error,
}

/// Voice state model
class VoiceState extends Equatable {
  final VoiceStatus status;
  final String? error;
  final Duration? recordingDuration;
  final double audioLevel;

  const VoiceState({
    required this.status,
    this.error,
    this.recordingDuration,
    this.audioLevel = 0.0,
  });

  VoiceState copyWith({
    VoiceStatus? status,
    String? error,
    Duration? recordingDuration,
    double? audioLevel,
  }) {
    return VoiceState(
      status: status ?? this.status,
      error: error ?? this.error,
      recordingDuration: recordingDuration ?? this.recordingDuration,
      audioLevel: audioLevel ?? this.audioLevel,
    );
  }

  bool get isListening => status == VoiceStatus.listening;
  bool get isProcessing => status == VoiceStatus.processing;
  bool get isSpeaking => status == VoiceStatus.speaking;
  bool get isIdle => status == VoiceStatus.idle;
  bool get hasError => status == VoiceStatus.error;

  @override
  List<Object?> get props => [status, error, recordingDuration, audioLevel];
}

/// Extension for display strings
extension VoiceStatusExtension on VoiceStatus {
  String get displayName {
    switch (this) {
      case VoiceStatus.idle:
        return 'Klar';
      case VoiceStatus.listening:
        return 'Lytter...';
      case VoiceStatus.processing:
        return 'Tænker...';
      case VoiceStatus.speaking:
        return 'Taler...';
      case VoiceStatus.error:
        return 'Fejl';
    }
  }
  
  /// Icon for current state
  String get icon {
    switch (this) {
      case VoiceStatus.idle:
        return '🎙️';
      case VoiceStatus.listening:
        return '🔵';
      case VoiceStatus.processing:
        return '🟣';
      case VoiceStatus.speaking:
        return '🔊';
      case VoiceStatus.error:
        return '❌';
    }
  }
}
