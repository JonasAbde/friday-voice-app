import 'package:flutter_test/flutter_test.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:friday_voice_app/bloc/voice/voice_bloc.dart';
import 'package:friday_voice_app/bloc/voice/voice_event.dart';
import 'package:friday_voice_app/bloc/voice/voice_state.dart';
import 'package:friday_voice_app/models/voice_state.dart' as model;

void main() {
  group('VoiceBloc', () {
    test('initial state is idle', () {
      final bloc = VoiceBloc();
      expect(
        bloc.state,
        equals(const VoiceBlocState.initial()),
      );
      bloc.close();
    });

    blocTest<VoiceBloc, VoiceBlocState>(
      'transitions to listening when StartListening is added',
      build: () => VoiceBloc(),
      act: (bloc) => bloc.add(const StartListening()),
      expect: () => [
        const VoiceBlocState(state: model.VoiceState.listening),
      ],
    );

    blocTest<VoiceBloc, VoiceBlocState>(
      'transitions to idle when StopListening is added',
      build: () => VoiceBloc(),
      seed: () => const VoiceBlocState(state: model.VoiceState.listening),
      act: (bloc) => bloc.add(const StopListening()),
      expect: () => [
        const VoiceBlocState(state: model.VoiceState.idle),
      ],
    );

    blocTest<VoiceBloc, VoiceBlocState>(
      'transitions to speaking when StartSpeaking is added',
      build: () => VoiceBloc(),
      act: (bloc) => bloc.add(const StartSpeaking()),
      expect: () => [
        const VoiceBlocState(state: model.VoiceState.speaking),
      ],
    );

    blocTest<VoiceBloc, VoiceBlocState>(
      'transitions to idle when StopSpeaking is added',
      build: () => VoiceBloc(),
      seed: () => const VoiceBlocState(state: model.VoiceState.speaking),
      act: (bloc) => bloc.add(const StopSpeaking()),
      expect: () => [
        const VoiceBlocState(state: model.VoiceState.idle),
      ],
    );

    blocTest<VoiceBloc, VoiceBlocState>(
      'updates audio level when AudioLevelUpdated is added',
      build: () => VoiceBloc(),
      act: (bloc) => bloc.add(const AudioLevelUpdated(level: 0.75)),
      expect: () => [
        const VoiceBlocState(
          state: model.VoiceState.idle,
          audioLevel: 0.75,
        ),
      ],
    );

    blocTest<VoiceBloc, VoiceBlocState>(
      'handles complete voice interaction flow',
      build: () => VoiceBloc(),
      act: (bloc) => bloc
        ..add(const StartListening())
        ..add(const AudioLevelUpdated(level: 0.5))
        ..add(const StopListening())
        ..add(const StartSpeaking())
        ..add(const StopSpeaking()),
      expect: () => [
        const VoiceBlocState(state: model.VoiceState.listening),
        const VoiceBlocState(
          state: model.VoiceState.listening,
          audioLevel: 0.5,
        ),
        const VoiceBlocState(
          state: model.VoiceState.idle,
          audioLevel: 0.5,
        ),
        const VoiceBlocState(
          state: model.VoiceState.speaking,
          audioLevel: 0.5,
        ),
        const VoiceBlocState(
          state: model.VoiceState.idle,
          audioLevel: 0.5,
        ),
      ],
    );
  });
}
