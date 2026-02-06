import 'package:equatable/equatable.dart';
import '../../models/connection_state.dart';

class ConnectionBlocState extends Equatable {
  final ConnectionState connectionState;

  const ConnectionBlocState({
    required this.connectionState,
  });

  const ConnectionBlocState.initial()
      : connectionState = const ConnectionState(
          status: ConnectionStatus.disconnected,
        );

  ConnectionBlocState copyWith({
    ConnectionState? connectionState,
  }) {
    return ConnectionBlocState(
      connectionState: connectionState ?? this.connectionState,
    );
  }

  @override
  List<Object?> get props => [connectionState];
}
