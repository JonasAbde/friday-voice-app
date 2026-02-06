import 'package:flutter_test/flutter_test.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:friday_voice_app/bloc/connection/connection_bloc.dart';
import 'package:friday_voice_app/bloc/connection/connection_event.dart';
import 'package:friday_voice_app/bloc/connection/connection_state.dart';
import 'package:friday_voice_app/services/network_service.dart';
import 'package:friday_voice_app/models/connection_state.dart' as model;

// Mock NetworkService
class MockNetworkService extends Mock implements NetworkService {}

void main() {
  group('ConnectionBloc', () {
    late MockNetworkService mockNetworkService;

    setUp(() {
      mockNetworkService = MockNetworkService();
      
      // Stub connectionStateStream to return empty stream by default
      when(() => mockNetworkService.connectionStateStream).thenAnswer(
        (_) => const Stream.empty(),
      );
      
      // Stub dispose to return Future<void>
      when(() => mockNetworkService.dispose()).thenAnswer((_) async {});
    });

    test('initial state is disconnected', () {
      final bloc = ConnectionBloc(networkService: mockNetworkService);
      expect(
        bloc.state,
        equals(const ConnectionBlocState.initial()),
      );
      bloc.close();
    });

    blocTest<ConnectionBloc, ConnectionBlocState>(
      'emits nothing when no events are added',
      build: () => ConnectionBloc(networkService: mockNetworkService),
      expect: () => [],
    );

    blocTest<ConnectionBloc, ConnectionBlocState>(
      'calls networkService.connect() when ConnectRequested is added',
      build: () {
        when(() => mockNetworkService.connect()).thenAnswer((_) async {});
        return ConnectionBloc(networkService: mockNetworkService);
      },
      act: (bloc) => bloc.add(const ConnectRequested()),
      verify: (_) {
        verify(() => mockNetworkService.connect()).called(1);
      },
    );

    blocTest<ConnectionBloc, ConnectionBlocState>(
      'calls networkService.disconnect() when DisconnectRequested is added',
      build: () {
        when(() => mockNetworkService.disconnect()).thenAnswer((_) async {});
        return ConnectionBloc(networkService: mockNetworkService);
      },
      act: (bloc) => bloc.add(const DisconnectRequested()),
      verify: (_) {
        verify(() => mockNetworkService.disconnect()).called(1);
      },
    );

    blocTest<ConnectionBloc, ConnectionBlocState>(
      'reconnects when ReconnectRequested is added',
      build: () {
        when(() => mockNetworkService.disconnect()).thenAnswer((_) async {});
        when(() => mockNetworkService.connect()).thenAnswer((_) async {});
        return ConnectionBloc(networkService: mockNetworkService);
      },
      act: (bloc) => bloc.add(const ReconnectRequested()),
      verify: (_) {
        verify(() => mockNetworkService.disconnect()).called(1);
        verify(() => mockNetworkService.connect()).called(1);
      },
    );

    blocTest<ConnectionBloc, ConnectionBlocState>(
      'updates state when connection status changes',
      build: () {
        // Create a stream controller to emit connection state changes
        final controller = Stream<model.ConnectionState>.fromIterable([
          const model.ConnectionState(
            status: model.ConnectionStatus.connecting,
          ),
          const model.ConnectionState(
            status: model.ConnectionStatus.connected,
          ),
        ]);
        
        when(() => mockNetworkService.connectionStateStream)
            .thenAnswer((_) => controller);
        when(() => mockNetworkService.connectionState)
            .thenReturn(const model.ConnectionState(
              status: model.ConnectionStatus.connected,
            ));
        
        return ConnectionBloc(networkService: mockNetworkService);
      },
      expect: () => [
        predicate<ConnectionBlocState>((state) =>
            state.connectionState.status == model.ConnectionStatus.connected),
      ],
    );
  });
}
