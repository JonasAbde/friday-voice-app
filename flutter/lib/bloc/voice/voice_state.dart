import 'package:equatable/equatable.dart';
import '../../models/voice_state.dart';

class VoiceBlocState extends Equatable {
  final VoiceState voiceState;

  const VoiceBlocState({
    required this.voiceState,
  });

  const VoiceBlocState.initial()
      : voiceState = const VoiceState(
          status: VoiceStatus.idle,
        );

  VoiceBlocState copyWith({
    VoiceState? voiceState,
  }) {
    return VoiceBlocState(
      voiceState: voiceState ?? this.voiceState,
    );
  }

  @override
  List<Object?> get props => [voiceState];
}
