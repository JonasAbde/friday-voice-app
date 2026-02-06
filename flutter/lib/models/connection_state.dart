// Connection state model
enum ConnectionStatus {
  disconnected,
  connecting,
  connected,
  reconnecting,
  error,
}

class ConnectionState {
  final ConnectionStatus status;
  final String? error;
  final int reconnectAttempts;
  final DateTime? lastConnected;

  const ConnectionState({
    required this.status,
    this.error,
    this.reconnectAttempts = 0,
    this.lastConnected,
  });

  ConnectionState copyWith({
    ConnectionStatus? status,
    String? error,
    int? reconnectAttempts,
    DateTime? lastConnected,
  }) {
    return ConnectionState(
      status: status ?? this.status,
      error: error ?? this.error,
      reconnectAttempts: reconnectAttempts ?? this.reconnectAttempts,
      lastConnected: lastConnected ?? this.lastConnected,
    );
  }

  bool get isConnected => status == ConnectionStatus.connected;
  bool get canSendMessages => isConnected;
}
