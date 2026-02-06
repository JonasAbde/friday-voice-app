# Flutter WebSocket Implementation - Code Examples

## Quick Integration Examples

### 1. Basic Setup in main.dart

```dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'services/network_service.dart';
import 'bloc/connection/connection_bloc.dart';
import 'bloc/message/message_bloc.dart';
import 'bloc/voice/voice_bloc.dart';

void main() {
  // Initialize WebSocket service
  final networkService = NetworkService(
    wsUrl: 'ws://192.168.1.100:8080/ws',  // Your Friday backend
    initialReconnectDelay: const Duration(seconds: 1),
    maxReconnectDelay: const Duration(seconds: 30),
    maxReconnectAttempts: 10,
  );

  runApp(
    MultiBlocProvider(
      providers: [
        BlocProvider(
          create: (_) => ConnectionBloc(networkService: networkService)
            ..add(const ConnectRequested()),  // Auto-connect on start
        ),
        BlocProvider(
          create: (_) => MessageBloc(networkService: networkService),
        ),
        BlocProvider(
          create: (_) => VoiceBloc(networkService: networkService),
        ),
      ],
      child: const MyApp(),
    ),
  );
}
```

### 2. Connection Status Indicator

```dart
// Minimal connection indicator
BlocBuilder<ConnectionBloc, ConnectionBlocState>(
  builder: (context, state) {
    final status = state.connectionState.status;
    final isConnected = state.connectionState.isConnected;
    
    return Row(
      children: [
        Icon(
          isConnected ? Icons.cloud_done : Icons.cloud_off,
          color: isConnected ? Colors.green : Colors.red,
        ),
        const SizedBox(width: 8),
        Text(status.name.toUpperCase()),
        if (status == ConnectionStatus.reconnecting)
          Text(' (${state.connectionState.reconnectAttempts})'),
      ],
    );
  },
)
```

### 3. Send Text Message

```dart
// From a TextField or button
void sendMessage(BuildContext context, String text) {
  context.read<MessageBloc>().add(MessageSent(text));
}

// Example with TextField
TextField(
  controller: _controller,
  onSubmitted: (text) {
    if (text.trim().isNotEmpty) {
      context.read<MessageBloc>().add(MessageSent(text.trim()));
      _controller.clear();
    }
  },
  decoration: InputDecoration(
    hintText: 'Type a message...',
    suffixIcon: IconButton(
      icon: const Icon(Icons.send),
      onPressed: () => sendMessage(context, _controller.text),
    ),
  ),
)
```

### 4. Display Message List

```dart
BlocBuilder<MessageBloc, MessageState>(
  builder: (context, state) {
    if (state.messages.isEmpty) {
      return const Center(
        child: Text('No messages yet. Start a conversation!'),
      );
    }

    return ListView.builder(
      reverse: true,  // Latest at bottom
      itemCount: state.messages.length,
      itemBuilder: (context, index) {
        final message = state.messages[index];
        final isUser = message.type == MessageType.user;

        return Align(
          alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
          child: Container(
            margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isUser ? Colors.blue : Colors.grey[300],
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  message.content,
                  style: TextStyle(
                    color: isUser ? Colors.white : Colors.black,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  _formatTime(message.timestamp),
                  style: TextStyle(
                    fontSize: 10,
                    color: isUser ? Colors.white70 : Colors.black54,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  },
)

String _formatTime(DateTime timestamp) {
  return '${timestamp.hour}:${timestamp.minute.toString().padLeft(2, '0')}';
}
```

### 5. Voice Recording Button

```dart
BlocBuilder<VoiceBloc, VoiceBlocState>(
  builder: (context, state) {
    final voiceStatus = state.voiceState.status;
    final isListening = voiceStatus == VoiceStatus.listening;

    return Column(
      children: [
        // Audio level indicator (when listening)
        if (state.voiceState.audioLevel != null)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: LinearProgressIndicator(
              value: state.voiceState.audioLevel! / 100,
              backgroundColor: Colors.grey[300],
              color: Colors.blue,
            ),
          ),

        const SizedBox(height: 16),

        // Microphone button
        GestureDetector(
          onTapDown: (_) {
            // Start recording on press
            context.read<VoiceBloc>().add(const StartListening());
          },
          onTapUp: (_) {
            // Stop recording on release
            context.read<VoiceBloc>().add(const StopListening());
          },
          onTapCancel: () {
            // Stop if gesture cancelled
            context.read<VoiceBloc>().add(const StopListening());
          },
          child: Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: isListening ? Colors.red : Colors.blue,
              shape: BoxShape.circle,
              boxShadow: [
                if (isListening)
                  BoxShadow(
                    color: Colors.red.withOpacity(0.5),
                    blurRadius: 20,
                    spreadRadius: 5,
                  ),
              ],
            ),
            child: Icon(
              isListening ? Icons.stop : Icons.mic,
              color: Colors.white,
              size: 40,
            ),
          ),
        ),

        const SizedBox(height: 8),

        // Status text
        Text(
          voiceStatus.name.toUpperCase(),
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
          ),
        ),

        // Recording duration
        if (state.voiceState.recordingDuration != null)
          Text(
            _formatDuration(state.voiceState.recordingDuration!),
            style: const TextStyle(fontSize: 10),
          ),
      ],
    );
  },
)

String _formatDuration(Duration duration) {
  final minutes = duration.inMinutes;
  final seconds = duration.inSeconds % 60;
  return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
}
```

### 6. Manual Reconnect Button

```dart
// Useful for debugging or when max retries reached
ElevatedButton(
  onPressed: () {
    context.read<ConnectionBloc>().add(const ReconnectRequested());
  },
  child: const Text('Reconnect'),
)
```

### 7. Connection Status Snackbar

```dart
// Show snackbar on connection changes
BlocListener<ConnectionBloc, ConnectionBlocState>(
  listener: (context, state) {
    final status = state.connectionState.status;

    if (status == ConnectionStatus.connected) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Connected to Friday'),
          backgroundColor: Colors.green,
          duration: Duration(seconds: 2),
        ),
      );
    } else if (status == ConnectionStatus.error) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            state.connectionState.error ?? 'Connection error',
          ),
          backgroundColor: Colors.red,
          duration: const Duration(seconds: 3),
        ),
      );
    }
  },
  child: YourWidget(),
)
```

### 8. Combining BlocBuilder and BlocListener

```dart
// Use BlocConsumer when you need both builder and listener
BlocConsumer<MessageBloc, MessageState>(
  listener: (context, state) {
    // Do side effects (navigation, snackbars, etc.)
    if (state.lastMessage?.type == MessageType.error) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(state.lastMessage!.content)),
      );
    }
  },
  builder: (context, state) {
    // Build UI
    return MessageListView(messages: state.messages);
  },
)
```

### 9. Conditional Rendering Based on Connection

```dart
BlocBuilder<ConnectionBloc, ConnectionBlocState>(
  builder: (context, state) {
    if (!state.connectionState.isConnected) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const CircularProgressIndicator(),
            const SizedBox(height: 16),
            Text(
              state.connectionState.status == ConnectionStatus.reconnecting
                ? 'Reconnecting...'
                : 'Connecting to Friday...',
            ),
          ],
        ),
      );
    }

    // Connected - show normal UI
    return VoiceInterface();
  },
)
```

### 10. Testing Example

```dart
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class MockNetworkService extends Mock implements NetworkService {}

void main() {
  late MockNetworkService mockNetworkService;

  setUp(() {
    mockNetworkService = MockNetworkService();
  });

  group('ConnectionBloc', () {
    blocTest<ConnectionBloc, ConnectionBlocState>(
      'emits connected state when connection succeeds',
      build: () => ConnectionBloc(networkService: mockNetworkService),
      act: (bloc) => bloc.add(const ConnectRequested()),
      expect: () => [
        predicate<ConnectionBlocState>(
          (state) => state.connectionState.status == 
                     ConnectionStatus.connecting,
        ),
        predicate<ConnectionBlocState>(
          (state) => state.connectionState.status == 
                     ConnectionStatus.connected,
        ),
      ],
    );

    blocTest<ConnectionBloc, ConnectionBlocState>(
      'handles disconnection',
      build: () => ConnectionBloc(networkService: mockNetworkService),
      seed: () => ConnectionBlocState(
        connectionState: const ConnectionState(
          status: ConnectionStatus.connected,
        ),
      ),
      act: (bloc) => bloc.add(const DisconnectRequested()),
      expect: () => [
        predicate<ConnectionBlocState>(
          (state) => state.connectionState.status == 
                     ConnectionStatus.disconnected,
        ),
      ],
    );
  });

  group('MessageBloc', () {
    blocTest<MessageBloc, MessageState>(
      'adds user message when sent',
      build: () => MessageBloc(networkService: mockNetworkService),
      act: (bloc) => bloc.add(const MessageSent('Hello')),
      expect: () => [
        predicate<MessageState>(
          (state) => state.messages.length == 1 &&
                     state.messages.first.content == 'Hello' &&
                     state.messages.first.type == MessageType.user,
        ),
      ],
    );
  });
}
```

## Backend WebSocket Message Format

### Expected JSON Messages

**Outgoing (Flutter → Backend)**:
```json
{
  "id": "1675890123456",
  "type": "user",
  "content": "What's the weather today?",
  "timestamp": "2026-02-06T15:22:00.000Z"
}
```

**Incoming (Backend → Flutter)**:
```json
{
  "id": "1675890123457",
  "type": "assistant",
  "content": "It's 22°C and sunny in Copenhagen!",
  "timestamp": "2026-02-06T15:22:01.000Z",
  "isTTS": true,
  "audioUrl": "https://backend.com/tts/response_12345.mp3"
}
```

**Binary Voice Data**:
```
// Send raw audio bytes directly
Uint8List audioChunk = ...;
networkService.sendBinary(audioChunk);
```

## Performance Tips

### 1. Selective Rebuilds

```dart
// Only rebuild when specific fields change
BlocBuilder<MessageBloc, MessageState>(
  buildWhen: (previous, current) {
    // Only rebuild if messages actually changed
    return previous.messages.length != current.messages.length;
  },
  builder: (context, state) {
    return MessageList(messages: state.messages);
  },
)
```

### 2. Debouncing Voice Events

```dart
// Avoid sending too many audio level updates
Timer? _audioLevelTimer;

void updateAudioLevel(double level) {
  _audioLevelTimer?.cancel();
  _audioLevelTimer = Timer(const Duration(milliseconds: 100), () {
    context.read<VoiceBloc>().add(AudioLevelUpdated(level));
  });
}
```

### 3. Efficient List Rendering

```dart
// Use ListView.builder (lazy loading) instead of ListView
ListView.builder(
  itemCount: messages.length,
  itemBuilder: (context, index) => MessageBubble(messages[index]),
)
```

## Error Handling Patterns

### 1. Connection Errors

```dart
BlocListener<ConnectionBloc, ConnectionBlocState>(
  listenWhen: (previous, current) {
    return current.connectionState.status == ConnectionStatus.error;
  },
  listener: (context, state) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Connection Error'),
        content: Text(state.connectionState.error ?? 'Unknown error'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              context.read<ConnectionBloc>().add(const ReconnectRequested());
            },
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  },
  child: YourWidget(),
)
```

### 2. Voice Errors

```dart
BlocListener<VoiceBloc, VoiceBlocState>(
  listenWhen: (previous, current) {
    return current.voiceState.status == VoiceStatus.error;
  },
  listener: (context, state) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Microphone error: ${state.voiceState.error}'),
        action: SnackBarAction(
          label: 'Dismiss',
          onPressed: () {},
        ),
      ),
    );
  },
  child: VoiceButton(),
)
```

---

**Ready to integrate!** Replace placeholder WebSocket URL and add audio packages.
