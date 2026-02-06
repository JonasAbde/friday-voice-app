import 'package:equatable/equatable.dart';
import '../../models/message.dart';

class MessageState extends Equatable {
  final List<Message> messages;
  final Message? lastMessage;

  const MessageState({
    this.messages = const [],
    this.lastMessage,
  });

  MessageState copyWith({
    List<Message>? messages,
    Message? lastMessage,
  }) {
    return MessageState(
      messages: messages ?? this.messages,
      lastMessage: lastMessage ?? this.lastMessage,
    );
  }

  @override
  List<Object?> get props => [messages, lastMessage];
}
