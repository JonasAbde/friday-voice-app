# Flutter WebSocket Client + State Management Documentation

## Overview

This implementation provides a production-ready WebSocket client with automatic reconnection and state management for the Friday Voice App using Flutter.

## Architecture Decisions

### 1. WebSocket Package: `web_socket_channel`

**Chosen**: `web_socket_channel` (official Flutter package)

**Rationale**:
- ✅ Official package maintained by Flutter team
- ✅ Cross-platform (iOS, Android, Web)
- ✅ Lightweight and fast
- ✅ Lower-level control for custom reconnection logic
- ✅ Better for voice streaming (binary data support)

**Comparison with `socket_io_client`**:
- socket_io_client: Feature-rich, heavier, built-in reconnection
- web_socket_channel: Lighter, more control, better for real-time binary streaming

### 2. State Management: `flutter_bloc`

**Chosen**: `flutter_bloc` (BLoC pattern)

**Rationale**:
- ✅ Predictable state transitions (critical for voice app state machine)
- ✅ Testable architecture (easy to mock and test)
- ✅ Clear separation of business logic and UI
- ✅ Event-driven (perfect for real-time WebSocket events)
- ✅ Excellent for complex state flows (idle → listening → processing → speaking)
- ✅ Built-in debugging and DevTools support

**Comparison**:
- **Riverpod**: Modern, compile-safe, but less structured for complex state machines
- **Provider**: Too simple for real-time voice app complexity
- **Bloc**: Best for event-driven real-time apps with complex state transitions

## Implementation Details

### 1. NetworkService (WebSocket Client)

**File**: `lib/services/network_service.dart`

**Features**:

#### Automatic Reconnection with Exponential Backoff
```dart
// Reconnection strategy:
// Attempt 1: Immediate
// Attempt 2: 1s delay
// Attempt 3: 2s delay
// Attempt 4: 4s delay
// Attempt 5: 8s delay
// Attempt 6: 16s delay
// Attempt 7+: 30s delay (max)
```

#### Two-Stream Architecture
- **Inner Stream**: Handles actual WebSocket connection
- **Outer Stream**: Exposed to consumers, remains stable during reconnections
- Uses `BehaviorSubject` from `rxdart` for state retention

#### Message Queueing
- Messages sent during disconnection are queued
- Automatically flushed when connection restores
- Prevents message loss during network instability

#### Connection States
```dart
enum ConnectionStatus {
  disconnected,   // Not connected
  connecting,     // Initial connection
  connected,      // Successfully connected
  reconnecting,   // Attempting to reconnect
  error,          // Connection error
}
```

#### Server Restart Handling
- Automatic ping/keep-alive (10s interval)
- Detects server restarts via `onDone` callback
- Immediate reconnection attempt, then exponential backoff

### 2. State Management (BLoC Pattern)

#### Connection Bloc

**Files**:
- `lib/bloc/connection/connection_bloc.dart`
- `lib/bloc/connection/connection_event.dart`
- `lib/bloc/connection/connection_state.dart`

**Responsibilities**:
- Manages WebSocket connection lifecycle
- Tracks connection status (connected/disconnected/reconnecting)
- Emits state changes for UI updates
- Handles reconnection requests

**Events**:
- `ConnectRequested` - User initiates connection
- `DisconnectRequested` - User disconnects
- `ConnectionStatusChanged` - Connection state updated
- `ReconnectRequested` - Manual reconnection trigger

#### Message Bloc

**Files**:
- `lib/bloc/message/message_bloc.dart`
- `lib/bloc/message/message_event.dart`
- `lib/bloc/message/message_state.dart`

**Responsibilities**:
- Manages message history
- Handles incoming/outgoing messages
- Parses JSON messages from WebSocket
- Maintains conversation state

**Events**:
- `MessageReceived` - Incoming message from server
- `MessageSent` - User sends message
- `MessagesCleared` - Clear conversation
- `MessageDeleted` - Delete specific message

#### Voice Bloc

**Files**:
- `lib/bloc/voice/voice_bloc.dart`
- `lib/bloc/voice/voice_event.dart`
- `lib/bloc/voice/voice_state.dart`

**Responsibilities**:
- Manages voice recording state machine
- Handles voice data streaming
- Tracks TTS playback state
- Updates audio level indicators

**State Machine**:
```
idle → listening → processing → speaking → idle
      ↑                                      ↓
      └──────────────────────────────────────┘
```

**Events**:
- `StartListening` - Start voice recording
- `StopListening` - Stop recording
- `VoiceDataReceived` - Audio chunk received
- `StartSpeaking` - TTS playback started
- `StopSpeaking` - TTS playback finished
- `AudioLevelUpdated` - Real-time audio level

### 3. Data Models

#### ConnectionState Model
```dart
class ConnectionState {
  final ConnectionStatus status;
  final String? error;
  final int reconnectAttempts;
  final DateTime? lastConnected;
}
```

#### VoiceState Model
```dart
class VoiceState {
  final VoiceStatus status;  // idle/listening/processing/speaking/error
  final String? error;
  final double? audioLevel;  // 0-100
  final Duration? recordingDuration;
}
```

#### Message Model
```dart
class Message {
  final String id;
  final MessageType type;  // user/assistant/system/error
  final String content;
  final DateTime timestamp;
  final bool isTTS;
  final String? audioUrl;
}
```

## Usage Examples

### 1. Initialize in Main App

```dart
void main() {
  final networkService = NetworkService(
    wsUrl: 'ws://your-backend.com/ws',
    initialReconnectDelay: const Duration(seconds: 1),
    maxReconnectDelay: const Duration(seconds: 30),
    maxReconnectAttempts: 10,
  );

  runApp(
    MultiBlocProvider(
      providers: [
        BlocProvider(
          create: (_) => ConnectionBloc(networkService: networkService)
            ..add(const ConnectRequested()),
        ),
        BlocProvider(
          create: (_) => MessageBloc(networkService: networkService),
        ),
        BlocProvider(
          create: (_) => VoiceBloc(networkService: networkService),
        ),
      ],
      child: MyApp(),
    ),
  );
}
```

### 2. Display Connection Status

```dart
BlocBuilder<ConnectionBloc, ConnectionBlocState>(
  builder: (context, state) {
    final isConnected = state.connectionState.isConnected;
    return Icon(
      isConnected ? Icons.cloud_done : Icons.cloud_off,
      color: isConnected ? Colors.green : Colors.red,
    );
  },
)
```

### 3. Send Message

```dart
context.read<MessageBloc>().add(
  MessageSent('Hello Friday!'),
);
```

### 4. Voice Recording

```dart
// Start listening
context.read<VoiceBloc>().add(const StartListening());

// Send voice data chunk
context.read<VoiceBloc>().add(
  VoiceDataReceived(audioData),
);

// Stop listening
context.read<VoiceBloc>().add(const StopListening());
```

### 5. Display Messages

```dart
BlocBuilder<MessageBloc, MessageState>(
  builder: (context, state) {
    return ListView.builder(
      itemCount: state.messages.length,
      itemBuilder: (context, index) {
        final message = state.messages[index];
        return MessageBubble(message: message);
      },
    );
  },
)
```

## Handling Network Loss

The implementation automatically handles:

1. **Network Loss**:
   - Detects via `onError` or `onDone` callbacks
   - Queues outgoing messages
   - Attempts reconnection with exponential backoff
   - Updates UI with "Reconnecting..." indicator

2. **Server Restart**:
   - Ping/keep-alive detects server down
   - Automatic reconnection on server recovery
   - Preserved message queue

3. **App Backgrounding** (iOS/Android):
   - WebSocket connection pauses in background
   - Auto-reconnect when app returns to foreground
   - Requires lifecycle management (add `WidgetsBindingObserver`)

## Performance Considerations

### Real-Time Updates (No Lag)
- Uses streams for instant state updates
- `BehaviorSubject` caches latest state
- Minimal widget rebuilds with `buildWhen` conditions

### Memory Management
- Automatic cleanup in `dispose()` methods
- Streams properly closed
- Timer cancellation on disconnect

### Battery Optimization
- Configurable ping interval (default: 10s)
- Closes connection when not needed
- Exponential backoff reduces battery drain during extended outages

## Testing

The BLoC architecture makes testing straightforward:

```dart
import 'package:bloc_test/bloc_test.dart';
import 'package:mocktail/mocktail.dart';

blocTest<ConnectionBloc, ConnectionBlocState>(
  'emits connected state when connection succeeds',
  build: () => ConnectionBloc(networkService: mockNetworkService),
  act: (bloc) => bloc.add(const ConnectRequested()),
  expect: () => [
    predicate<ConnectionBlocState>(
      (state) => state.connectionState.status == ConnectionStatus.connecting,
    ),
    predicate<ConnectionBlocState>(
      (state) => state.connectionState.status == ConnectionStatus.connected,
    ),
  ],
);
```

## Dependencies

```yaml
dependencies:
  web_socket_channel: ^2.4.0  # Official WebSocket package
  flutter_bloc: ^8.1.3        # BLoC state management
  equatable: ^2.0.5           # Value equality
  rxdart: ^0.27.7             # Reactive streams

dev_dependencies:
  bloc_test: ^9.1.5           # BLoC testing utilities
  mocktail: ^1.0.1            # Mocking framework
```

## File Structure

```
lib/
├── main.dart                           # App entry point
├── services/
│   └── network_service.dart            # WebSocket client
├── bloc/
│   ├── connection/
│   │   ├── connection_bloc.dart
│   │   ├── connection_event.dart
│   │   └── connection_state.dart
│   ├── message/
│   │   ├── message_bloc.dart
│   │   ├── message_event.dart
│   │   └── message_state.dart
│   └── voice/
│       ├── voice_bloc.dart
│       ├── voice_event.dart
│       └── voice_state.dart
└── models/
    ├── connection_state.dart
    ├── voice_state.dart
    └── message.dart
```

## Next Steps

1. **Audio Integration**:
   - Add `flutter_sound` or `record` package for voice recording
   - Implement audio streaming to WebSocket
   - Add TTS playback with `audioplayers` or `just_audio`

2. **Lifecycle Management**:
   - Add `WidgetsBindingObserver` to handle app backgrounding
   - Pause/resume WebSocket on app state changes

3. **Error Handling**:
   - Add user-facing error messages
   - Retry UI for failed connections
   - Network diagnostics screen

4. **Security**:
   - Add WSS (secure WebSocket) support
   - Implement authentication token handling
   - Add message encryption

## Conclusion

This implementation provides:
- ✅ Production-ready WebSocket client with auto-reconnection
- ✅ Exponential backoff strategy (1s → 30s max delay)
- ✅ Message queueing during disconnection
- ✅ Graceful server restart handling
- ✅ Zero-lag real-time state updates
- ✅ Testable BLoC architecture
- ✅ Clean separation of concerns
- ✅ Comprehensive state management for voice app

**Ready for integration with Friday backend WebSocket server!**
