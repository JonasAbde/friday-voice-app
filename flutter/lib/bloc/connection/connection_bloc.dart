import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../services/network_service.dart';
import 'connection_event.dart';
import 'connection_state.dart';

class ConnectionBloc extends Bloc<ConnectionEvent, ConnectionBlocState> {
  final NetworkService networkService;
  StreamSubscription? _connectionSubscription;

  ConnectionBloc({required this.networkService})
      : super(const ConnectionBlocState.initial()) {
    on<ConnectRequested>(_onConnectRequested);
    on<DisconnectRequested>(_onDisconnectRequested);
    on<ConnectionStatusChanged>(_onConnectionStatusChanged);
    on<ReconnectRequested>(_onReconnectRequested);

    // Listen to network service connection state
    _connectionSubscription = networkService.connectionStateStream.listen(
      (connectionState) {
        add(ConnectionStatusChanged(
          status: connectionState.status.name,
          error: connectionState.error,
          reconnectAttempts: connectionState.reconnectAttempts,
        ));
      },
    );
  }

  Future<void> _onConnectRequested(
    ConnectRequested event,
    Emitter<ConnectionBlocState> emit,
  ) async {
    await networkService.connect();
  }

  Future<void> _onDisconnectRequested(
    DisconnectRequested event,
    Emitter<ConnectionBlocState> emit,
  ) async {
    await networkService.disconnect();
  }

  Future<void> _onConnectionStatusChanged(
    ConnectionStatusChanged event,
    Emitter<ConnectionBlocState> emit,
  ) async {
    emit(state.copyWith(
      connectionState: networkService.connectionState,
    ));
  }

  Future<void> _onReconnectRequested(
    ReconnectRequested event,
    Emitter<ConnectionBlocState> emit,
  ) async {
    await networkService.disconnect();
    await networkService.connect();
  }

  @override
  Future<void> close() {
    _connectionSubscription?.cancel();
    networkService.dispose();
    return super.close();
  }
}
