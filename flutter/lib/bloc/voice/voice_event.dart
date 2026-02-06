import 'package:equatable/equatable.dart';
import 'dart:typed_data';

abstract class VoiceEvent extends Equatable {
  const VoiceEvent();

  @override
  List<Object?> get props => [];
}

class StartListening extends VoiceEvent {
  const StartListening();
}

class StopListening extends VoiceEvent {
  const StopListening();
}

class VoiceDataReceived extends VoiceEvent {
  final Uint8List audioData;

  const VoiceDataReceived(this.audioData);

  @override
  List<Object?> get props => [audioData];
}

class StartSpeaking extends VoiceEvent {
  final String audioUrl;

  const StartSpeaking(this.audioUrl);

  @override
  List<Object?> get props => [audioUrl];
}

class StopSpeaking extends VoiceEvent {
  const StopSpeaking();
}

class VoiceError extends VoiceEvent {
  final String error;

  const VoiceError(this.error);

  @override
  List<Object?> get props => [error];
}

class AudioLevelUpdated extends VoiceEvent {
  final double level;

  const AudioLevelUpdated(this.level);

  @override
  List<Object?> get props => [level];
}
