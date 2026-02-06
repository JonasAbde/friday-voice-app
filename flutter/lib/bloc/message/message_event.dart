import 'package:equatable/equatable.dart';
import '../../models/message.dart';

abstract class MessageEvent extends Equatable {
  const MessageEvent();

  @override
  List<Object?> get props => [];
}

class MessageReceived extends MessageEvent {
  final Message message;

  const MessageReceived(this.message);

  @override
  List<Object?> get props => [message];
}

class MessageSent extends MessageEvent {
  final String content;

  const MessageSent(this.content);

  @override
  List<Object?> get props => [content];
}

class MessagesCleared extends MessageEvent {
  const MessagesCleared();
}

class MessageDeleted extends MessageEvent {
  final String messageId;

  const MessageDeleted(this.messageId);

  @override
  List<Object?> get props => [messageId];
}
