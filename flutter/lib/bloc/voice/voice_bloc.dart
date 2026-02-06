import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../services/network_service.dart';
import '../../models/voice_state.dart';
import 'voice_event.dart';
import 'voice_state.dart';

class VoiceBloc extends Bloc<VoiceEvent, VoiceBlocState> {
  final NetworkService networkService;
  DateTime? _recordingStartTime;

  VoiceBloc({required this.networkService})
      : super(const VoiceBlocState.initial()) {
    on<StartListening>(_onStartListening);
    on<StopListening>(_onStopListening);
    on<VoiceDataReceived>(_onVoiceDataReceived);
    on<StartSpeaking>(_onStartSpeaking);
    on<StopSpeaking>(_onStopSpeaking);
    on<VoiceError>(_onVoiceError);
    on<AudioLevelUpdated>(_onAudioLevelUpdated);
  }

  Future<void> _onStartListening(
    StartListening event,
    Emitter<VoiceBlocState> emit,
  ) async {
    _recordingStartTime = DateTime.now();
    emit(state.copyWith(
      voiceState: const VoiceState(status: VoiceStatus.listening),
    ));
  }

  Future<void> _onStopListening(
    StopListening event,
    Emitter<VoiceBlocState> emit,
  ) async {
    emit(state.copyWith(
      voiceState: const VoiceState(status: VoiceStatus.processing),
    ));
    _recordingStartTime = null;
  }

  Future<void> _onVoiceDataReceived(
    VoiceDataReceived event,
    Emitter<VoiceBlocState> emit,
  ) async {
    // Send voice data to server
    networkService.sendBinary(event.audioData);

    // Update recording duration
    if (_recordingStartTime != null) {
      final duration = DateTime.now().difference(_recordingStartTime!);
      emit(state.copyWith(
        voiceState: state.voiceState.copyWith(
          recordingDuration: duration,
        ),
      ));
    }
  }

  Future<void> _onStartSpeaking(
    StartSpeaking event,
    Emitter<VoiceBlocState> emit,
  ) async {
    emit(state.copyWith(
      voiceState: const VoiceState(status: VoiceStatus.speaking),
    ));
  }

  Future<void> _onStopSpeaking(
    StopSpeaking event,
    Emitter<VoiceBlocState> emit,
  ) async {
    emit(state.copyWith(
      voiceState: const VoiceState(status: VoiceStatus.idle),
    ));
  }

  Future<void> _onVoiceError(
    VoiceError event,
    Emitter<VoiceBlocState> emit,
  ) async {
    emit(state.copyWith(
      voiceState: VoiceState(
        status: VoiceStatus.error,
        error: event.error,
      ),
    ));
  }

  Future<void> _onAudioLevelUpdated(
    AudioLevelUpdated event,
    Emitter<VoiceBlocState> emit,
  ) async {
    if (state.voiceState.isListening) {
      emit(state.copyWith(
        voiceState: state.voiceState.copyWith(
          audioLevel: event.level,
        ),
      ));
    }
  }
}
