import 'package:equatable/equatable.dart';

abstract class ConnectionEvent extends Equatable {
  const ConnectionEvent();

  @override
  List<Object?> get props => [];
}

class ConnectRequested extends ConnectionEvent {
  const ConnectRequested();
}

class DisconnectRequested extends ConnectionEvent {
  const DisconnectRequested();
}

class ConnectionStatusChanged extends ConnectionEvent {
  final String status;
  final String? error;
  final int reconnectAttempts;

  const ConnectionStatusChanged({
    required this.status,
    this.error,
    this.reconnectAttempts = 0,
  });

  @override
  List<Object?> get props => [status, error, reconnectAttempts];
}

class ReconnectRequested extends ConnectionEvent {
  const ReconnectRequested();
}
