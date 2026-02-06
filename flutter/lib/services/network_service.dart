import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';
import 'package:rxdart/rxdart.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:web_socket_channel/io.dart';
import '../models/connection_state.dart';
import '../core/error/error_handler.dart';

/// WebSocket network service with automatic reconnection
/// 
/// Features:
/// - Exponential backoff reconnection strategy
/// - Message queueing during disconnection
/// - Automatic server restart recovery
/// - Real-time connection state updates
class NetworkService {
  final String wsUrl;
  final Duration initialReconnectDelay;
  final Duration maxReconnectDelay;
  final int maxReconnectAttempts;

  WebSocketChannel? _channel;
  Stream<dynamic>? _innerStream;
  
  // Two-stream strategy: inner stream for connection, outer stream for consumers
  final _outerStreamSubject = BehaviorSubject<dynamic>();
  final _connectionStateSubject = BehaviorSubject<ConnectionState>.seeded(
    const ConnectionState(status: ConnectionStatus.disconnected),
  );

  // Message queue for offline messages
  final _messageQueue = <String>[];
  
  // Reconnection state
  int _reconnectAttempts = 0;
  bool _isFirstRestart = false;
  bool _isFollowingRestart = false;
  bool _isManuallyClosed = false;
  Timer? _reconnectTimer;

  NetworkService({
    required this.wsUrl,
    this.initialReconnectDelay = const Duration(seconds: 1),
    this.maxReconnectDelay = const Duration(seconds: 30),
    this.maxReconnectAttempts = 10,
  });

  /// Stream of incoming messages
  Stream<dynamic> get messageStream => _outerStreamSubject.stream;

  /// Stream of connection state changes
  Stream<ConnectionState> get connectionStateStream => _connectionStateSubject.stream;

  /// Current connection state
  ConnectionState get connectionState => _connectionStateSubject.value;

  /// Connect to WebSocket server
  Future<void> connect() async {
    if (_isManuallyClosed) {
      _isManuallyClosed = false;
    }
    await _startConnection();
  }

  /// Disconnect from WebSocket server
  Future<void> disconnect() async {
    _isManuallyClosed = true;
    _reconnectTimer?.cancel();
    await _channel?.sink.close();
    _updateConnectionState(
      const ConnectionState(status: ConnectionStatus.disconnected),
    );
  }

  /// Send text message
  void sendMessage(String message) {
    if (_connectionStateSubject.value.canSendMessages) {
      _channel?.sink.add(message);
    } else {
      // Queue message for later
      _messageQueue.add(message);
      print('Message queued (offline): $message');
    }
  }

  /// Send binary data (voice chunks)
  void sendBinary(Uint8List data) {
    if (_connectionStateSubject.value.canSendMessages) {
      _channel?.sink.add(data);
    } else {
      print('Cannot send binary data: not connected');
    }
  }

  /// Send JSON object
  void sendJson(Map<String, dynamic> data) {
    sendMessage(jsonEncode(data));
  }

  /// Internal: Start WebSocket connection
  Future<void> _startConnection() async {
    try {
      _updateConnectionState(
        ConnectionState(
          status: _reconnectAttempts > 0 
            ? ConnectionStatus.reconnecting 
            : ConnectionStatus.connecting,
          reconnectAttempts: _reconnectAttempts,
        ),
      );

      // Create new WebSocket connection
      _channel = IOWebSocketChannel.connect(
        Uri.parse(wsUrl),
        pingInterval: const Duration(seconds: 10), // Keep-alive
      );

      _innerStream = _channel!.stream;

      // Listen to inner stream
      _innerStream!.listen(
        _handleMessage,
        onError: _handleError,
        onDone: _handleDone,
        cancelOnError: false,
      );

      // Connection successful
      _reconnectAttempts = 0;
      _isFirstRestart = false;
      _updateConnectionState(
        ConnectionState(
          status: ConnectionStatus.connected,
          lastConnected: DateTime.now(),
          reconnectAttempts: 0,
        ),
      );

      // Send queued messages
      _flushMessageQueue();
      
    } catch (e) {
      _handleError(e);
    }
  }

  /// Handle incoming message
  void _handleMessage(dynamic message) {
    _outerStreamSubject.add(message);
  }

  /// Handle WebSocket error
  void _handleError(dynamic error) {
    print('WebSocket error: $error');
    
    // Report to error handler
    ErrorHandler.handleError(
      error,
      context: 'NetworkService.WebSocket',
      extras: {
        'wsUrl': wsUrl,
        'reconnectAttempts': _reconnectAttempts,
      },
    );
    
    _updateConnectionState(
      ConnectionState(
        status: ConnectionStatus.error,
        error: error.toString(),
        reconnectAttempts: _reconnectAttempts,
      ),
    );
    _handleLostConnection();
  }

  /// Handle WebSocket disconnection
  void _handleDone() {
    print('WebSocket connection closed');
    if (!_isManuallyClosed) {
      _handleLostConnection();
    }
  }

  /// Handle lost connection with exponential backoff
  void _handleLostConnection() {
    if (_isManuallyClosed) return;

    _reconnectAttempts++;

    if (_reconnectAttempts > maxReconnectAttempts) {
      _updateConnectionState(
        ConnectionState(
          status: ConnectionStatus.error,
          error: 'Max reconnection attempts reached',
          reconnectAttempts: _reconnectAttempts,
        ),
      );
      return;
    }

    // Exponential backoff: delay = min(initialDelay * 2^attempts, maxDelay)
    final delay = _calculateBackoffDelay();

    _updateConnectionState(
      ConnectionState(
        status: ConnectionStatus.reconnecting,
        reconnectAttempts: _reconnectAttempts,
      ),
    );

    print('Reconnecting in ${delay.inSeconds}s (attempt $_reconnectAttempts)...');

    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(delay, () {
      _startConnection();
    });
  }

  /// Calculate exponential backoff delay
  Duration _calculateBackoffDelay() {
    // First reconnect is immediate
    if (_reconnectAttempts == 1) {
      return Duration.zero;
    }

    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 30s (max)
    final delayMs = (initialReconnectDelay.inMilliseconds * 
                     (1 << (_reconnectAttempts - 2))).clamp(
      initialReconnectDelay.inMilliseconds,
      maxReconnectDelay.inMilliseconds,
    );

    return Duration(milliseconds: delayMs);
  }

  /// Flush queued messages
  void _flushMessageQueue() {
    if (_messageQueue.isEmpty) return;

    print('Flushing ${_messageQueue.length} queued messages...');
    
    for (final message in _messageQueue) {
      sendMessage(message);
    }
    _messageQueue.clear();
  }

  /// Update connection state
  void _updateConnectionState(ConnectionState state) {
    _connectionStateSubject.add(state);
  }

  /// Dispose resources
  Future<void> dispose() async {
    _reconnectTimer?.cancel();
    _isManuallyClosed = true;
    await _channel?.sink.close();
    await _outerStreamSubject.close();
    await _connectionStateSubject.close();
  }
}
