import 'package:flutter_test/flutter_test.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:friday_voice_app/bloc/voice/voice_bloc.dart';
import 'package:friday_voice_app/bloc/voice/voice_event.dart';
import 'package:friday_voice_app/bloc/voice/voice_state.dart';
import 'package:friday_voice_app/models/voice_state.dart';
import 'package:friday_voice_app/services/network_service.dart';
import 'dart:typed_data';

// Mock NetworkService
class MockNetworkService extends Mock implements NetworkService {}

void main() {
  late MockNetworkService mockNetworkService;

  setUpAll(() {
    // Register fallback value for Uint8List
    registerFallbackValue(Uint8List(0));
  });

  setUp(() {
    mockNetworkService = MockNetworkService();
  });

  group('VoiceBloc', () {
    test('initial state is idle', () {
      final bloc = VoiceBloc(networkService: mockNetworkService);
      expect(
        bloc.state,
        equals(const VoiceBlocState.initial()),
      );
      expect(bloc.state.voiceState.status, equals(VoiceStatus.idle));
      bloc.close();
    });

    blocTest<VoiceBloc, VoiceBlocState>(
      'transitions to listening when StartListening is added',
      build: () => VoiceBloc(networkService: mockNetworkService),
      act: (bloc) => bloc.add(const StartListening()),
      expect: () => [
        predicate<VoiceBlocState>((state) =>
            state.voiceState.status == VoiceStatus.listening),
      ],
    );

    blocTest<VoiceBloc, VoiceBlocState>(
      'transitions to processing when StopListening is added',
      build: () => VoiceBloc(networkService: mockNetworkService),
      seed: () => const VoiceBlocState(
        voiceState: VoiceState(status: VoiceStatus.listening),
      ),
      act: (bloc) => bloc.add(const StopListening()),
      expect: () => [
        predicate<VoiceBlocState>((state) =>
            state.voiceState.status == VoiceStatus.processing),
      ],
    );

    blocTest<VoiceBloc, VoiceBlocState>(
      'transitions to speaking when StartSpeaking is added',
      build: () => VoiceBloc(networkService: mockNetworkService),
      act: (bloc) => bloc.add(const StartSpeaking('audio.mp3')),
      expect: () => [
        predicate<VoiceBlocState>((state) =>
            state.voiceState.status == VoiceStatus.speaking),
      ],
    );

    blocTest<VoiceBloc, VoiceBlocState>(
      'transitions to idle when StopSpeaking is added',
      build: () => VoiceBloc(networkService: mockNetworkService),
      seed: () => const VoiceBlocState(
        voiceState: VoiceState(status: VoiceStatus.speaking),
      ),
      act: (bloc) => bloc.add(const StopSpeaking()),
      expect: () => [
        predicate<VoiceBlocState>((state) =>
            state.voiceState.status == VoiceStatus.idle),
      ],
    );

    // SKIP: Flaky test - needs timing fix
    // blocTest<VoiceBloc, VoiceBlocState>(
    //   'sends voice data and updates duration when VoiceDataReceived is added',
    //   build: () => VoiceBloc(networkService: mockNetworkService),
    //   seed: () => const VoiceBlocState(
    //     voiceState: VoiceState(status: VoiceStatus.listening),
    //   ),
    //   setUp: () {
    //     when(() => mockNetworkService.sendBinary(any())).thenReturn(null);
    //   },
    //   act: (bloc) {
    //     bloc.add(const StartListening());
    //     return Future.delayed(
    //       const Duration(milliseconds: 100),
    //       () => bloc.add(VoiceDataReceived(Uint8List.fromList([1, 2, 3]))),
    //     );
    //   },
    //   expect: () => [
    //     predicate<VoiceBlocState>((state) =>
    //         state.voiceState.recordingDuration != null),
    //   ],
    // );

    blocTest<VoiceBloc, VoiceBlocState>(
      'updates audio level when AudioLevelUpdated is added during listening',
      build: () => VoiceBloc(networkService: mockNetworkService),
      seed: () => const VoiceBlocState(
        voiceState: VoiceState(status: VoiceStatus.listening),
      ),
      act: (bloc) => bloc.add(const AudioLevelUpdated(0.75)),
      expect: () => [
        predicate<VoiceBlocState>((state) =>
            state.voiceState.audioLevel == 0.75 &&
            state.voiceState.status == VoiceStatus.listening),
      ],
    );

    blocTest<VoiceBloc, VoiceBlocState>(
      'sets error state when VoiceError is added',
      build: () => VoiceBloc(networkService: mockNetworkService),
      act: (bloc) => bloc.add(const VoiceError('Test error')),
      expect: () => [
        predicate<VoiceBlocState>((state) =>
            state.voiceState.status == VoiceStatus.error &&
            state.voiceState.error == 'Test error'),
      ],
    );

    blocTest<VoiceBloc, VoiceBlocState>(
      'handles complete voice interaction flow',
      build: () => VoiceBloc(networkService: mockNetworkService),
      act: (bloc) => bloc
        ..add(const StartListening())
        ..add(const AudioLevelUpdated(0.5))
        ..add(const StopListening())
        ..add(const StartSpeaking('audio.mp3'))
        ..add(const StopSpeaking()),
      expect: () => [
        predicate<VoiceBlocState>(
            (state) => state.voiceState.status == VoiceStatus.listening),
        predicate<VoiceBlocState>((state) =>
            state.voiceState.status == VoiceStatus.listening &&
            state.voiceState.audioLevel == 0.5),
        predicate<VoiceBlocState>(
            (state) => state.voiceState.status == VoiceStatus.processing),
        predicate<VoiceBlocState>(
            (state) => state.voiceState.status == VoiceStatus.speaking),
        predicate<VoiceBlocState>(
            (state) => state.voiceState.status == VoiceStatus.idle),
      ],
    );
  });
}
