/// Chat message model
class Message {
  final String id;
  final String text;
  final bool isUser;
  final DateTime timestamp;
  final MessageType type;
  
  const Message({
    required this.id,
    required this.text,
    required this.isUser,
    required this.timestamp,
    this.type = MessageType.text,
  });
  
  /// Create user message
  factory Message.user(String text) {
    return Message(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      text: text,
      isUser: true,
      timestamp: DateTime.now(),
    );
  }
  
  /// Create assistant message
  factory Message.assistant(String text) {
    return Message(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      text: text,
      isUser: false,
      timestamp: DateTime.now(),
    );
  }
}

enum MessageType {
  text,
  audio,
  error,
}
