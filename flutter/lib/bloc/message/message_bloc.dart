import 'dart:async';
import 'dart:convert';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../services/network_service.dart';
import '../../models/message.dart';
import 'message_event.dart';
import 'message_state.dart';

class MessageBloc extends Bloc<MessageEvent, MessageState> {
  final NetworkService networkService;
  StreamSubscription? _messageSubscription;

  MessageBloc({required this.networkService}) : super(const MessageState()) {
    on<MessageReceived>(_onMessageReceived);
    on<MessageSent>(_onMessageSent);
    on<MessagesCleared>(_onMessagesCleared);
    on<MessageDeleted>(_onMessageDeleted);

    // Listen to network service messages
    _messageSubscription = networkService.messageStream.listen(
      (data) {
        try {
          final json = jsonDecode(data as String) as Map<String, dynamic>;
          final message = Message.fromJson(json);
          add(MessageReceived(message));
        } catch (e) {
          print('Error parsing message: $e');
        }
      },
    );
  }

  Future<void> _onMessageReceived(
    MessageReceived event,
    Emitter<MessageState> emit,
  ) async {
    final updatedMessages = List<Message>.from(state.messages)
      ..add(event.message);
    
    emit(state.copyWith(
      messages: updatedMessages,
      lastMessage: event.message,
    ));
  }

  Future<void> _onMessageSent(
    MessageSent event,
    Emitter<MessageState> emit,
  ) async {
    final userMessage = Message(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      type: MessageType.user,
      content: event.content,
      timestamp: DateTime.now(),
    );

    final updatedMessages = List<Message>.from(state.messages)
      ..add(userMessage);

    emit(state.copyWith(
      messages: updatedMessages,
      lastMessage: userMessage,
    ));

    // Send to server
    networkService.sendJson(userMessage.toJson());
  }

  Future<void> _onMessagesCleared(
    MessagesCleared event,
    Emitter<MessageState> emit,
  ) async {
    emit(const MessageState());
  }

  Future<void> _onMessageDeleted(
    MessageDeleted event,
    Emitter<MessageState> emit,
  ) async {
    final updatedMessages = state.messages
        .where((msg) => msg.id != event.messageId)
        .toList();

    emit(state.copyWith(messages: updatedMessages));
  }

  @override
  Future<void> close() {
    _messageSubscription?.cancel();
    return super.close();
  }
}
