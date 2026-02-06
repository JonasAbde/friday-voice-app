import 'package:flutter_test/flutter_test.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:friday_voice_app/bloc/message/message_bloc.dart';
import 'package:friday_voice_app/bloc/message/message_event.dart';
import 'package:friday_voice_app/bloc/message/message_state.dart';
import 'package:friday_voice_app/models/message.dart';

void main() {
  group('MessageBloc', () {
    test('initial state has empty messages', () {
      final bloc = MessageBloc();
      expect(
        bloc.state,
        equals(const MessageBlocState.initial()),
      );
      expect(bloc.state.messages, isEmpty);
      bloc.close();
    });

    blocTest<MessageBloc, MessageBlocState>(
      'adds user message when MessageSent is added',
      build: () => MessageBloc(),
      act: (bloc) => bloc.add(
        MessageSent(
          Message(
            id: '1',
            content: 'Hello Friday',
            isUser: true,
            timestamp: DateTime(2026, 2, 6),
          ),
        ),
      ),
      expect: () => [
        predicate<MessageBlocState>((state) {
          return state.messages.length == 1 &&
              state.messages.first.content == 'Hello Friday' &&
              state.messages.first.isUser == true &&
              state.lastMessage?.content == 'Hello Friday';
        }),
      ],
    );

    blocTest<MessageBloc, MessageBlocState>(
      'adds assistant message when MessageReceived is added',
      build: () => MessageBloc(),
      act: (bloc) => bloc.add(
        MessageReceived(
          Message(
            id: '2',
            content: 'Hi! How can I help?',
            isUser: false,
            timestamp: DateTime(2026, 2, 6),
          ),
        ),
      ),
      expect: () => [
        predicate<MessageBlocState>((state) {
          return state.messages.length == 1 &&
              state.messages.first.content == 'Hi! How can I help?' &&
              state.messages.first.isUser == false;
        }),
      ],
    );

    blocTest<MessageBloc, MessageBlocState>(
      'maintains message order (newest last)',
      build: () => MessageBloc(),
      act: (bloc) => bloc
        ..add(MessageSent(Message(
          id: '1',
          content: 'First',
          isUser: true,
          timestamp: DateTime(2026, 2, 6, 10, 0),
        )))
        ..add(MessageReceived(Message(
          id: '2',
          content: 'Second',
          isUser: false,
          timestamp: DateTime(2026, 2, 6, 10, 1),
        )))
        ..add(MessageSent(Message(
          id: '3',
          content: 'Third',
          isUser: true,
          timestamp: DateTime(2026, 2, 6, 10, 2),
        ))),
      expect: () => [
        predicate<MessageBlocState>((state) => state.messages.length == 1),
        predicate<MessageBlocState>((state) => state.messages.length == 2),
        predicate<MessageBlocState>((state) {
          return state.messages.length == 3 &&
              state.messages[0].content == 'First' &&
              state.messages[1].content == 'Second' &&
              state.messages[2].content == 'Third';
        }),
      ],
    );

    blocTest<MessageBloc, MessageBlocState>(
      'clears all messages when ClearMessages is added',
      build: () => MessageBloc(),
      seed: () => MessageBlocState(
        messages: [
          Message(
            id: '1',
            content: 'Test',
            isUser: true,
            timestamp: DateTime.now(),
          ),
        ],
      ),
      act: (bloc) => bloc.add(const ClearMessages()),
      expect: () => [
        const MessageBlocState(messages: []),
      ],
    );

    blocTest<MessageBloc, MessageBlocState>(
      'deletes specific message when DeleteMessage is added',
      build: () => MessageBloc(),
      seed: () => MessageBlocState(
        messages: [
          Message(
            id: '1',
            content: 'Keep this',
            isUser: true,
            timestamp: DateTime.now(),
          ),
          Message(
            id: '2',
            content: 'Delete this',
            isUser: false,
            timestamp: DateTime.now(),
          ),
        ],
      ),
      act: (bloc) => bloc.add(const DeleteMessage(messageId: '2')),
      expect: () => [
        predicate<MessageBlocState>((state) {
          return state.messages.length == 1 &&
              state.messages.first.id == '1';
        }),
      ],
    );

    blocTest<MessageBloc, MessageBlocState>(
      'updates lastMessage correctly',
      build: () => MessageBloc(),
      act: (bloc) => bloc
        ..add(MessageSent(Message(
          id: '1',
          content: 'First message',
          isUser: true,
          timestamp: DateTime.now(),
        )))
        ..add(MessageReceived(Message(
          id: '2',
          content: 'Last message',
          isUser: false,
          timestamp: DateTime.now(),
        ))),
      verify: (bloc) {
        expect(bloc.state.lastMessage?.content, equals('Last message'));
      },
    );
  });
}
