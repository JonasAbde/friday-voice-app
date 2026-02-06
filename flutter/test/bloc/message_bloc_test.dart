import 'package:flutter_test/flutter_test.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:friday_voice_app/bloc/message/message_bloc.dart';
import 'package:friday_voice_app/bloc/message/message_event.dart';
import 'package:friday_voice_app/bloc/message/message_state.dart';
import 'package:friday_voice_app/models/message.dart';
import 'package:friday_voice_app/services/network_service.dart';

// Mock NetworkService
class MockNetworkService extends Mock implements NetworkService {}

void main() {
  late MockNetworkService mockNetworkService;

  setUp(() {
    mockNetworkService = MockNetworkService();
    
    // Stub messageStream to return empty stream by default
    when(() => mockNetworkService.messageStream).thenAnswer(
      (_) => const Stream.empty(),
    );
  });

  group('MessageBloc', () {
    test('initial state has empty messages', () {
      final bloc = MessageBloc(networkService: mockNetworkService);
      expect(
        bloc.state,
        equals(const MessageState()),
      );
      expect(bloc.state.messages, isEmpty);
      bloc.close();
    });

    blocTest<MessageBloc, MessageState>(
      'adds user message when MessageSent is added',
      build: () => MessageBloc(networkService: mockNetworkService),
      setUp: () {
        when(() => mockNetworkService.sendJson(any())).thenReturn(null);
      },
      act: (bloc) => bloc.add(
        const MessageSent('Hello Friday'),
      ),
      expect: () => [
        predicate<MessageState>((state) {
          return state.messages.length == 1 &&
              state.messages.first.text == 'Hello Friday' &&
              state.messages.first.isUser == true &&
              state.lastMessage?.text == 'Hello Friday';
        }),
      ],
    );

    blocTest<MessageBloc, MessageState>(
      'adds assistant message when MessageReceived is added',
      build: () => MessageBloc(networkService: mockNetworkService),
      act: (bloc) => bloc.add(
        MessageReceived(
          Message(
            id: '2',
            text: 'Hi! How can I help?',
            isUser: false,
            timestamp: DateTime(2026, 2, 6),
          ),
        ),
      ),
      expect: () => [
        predicate<MessageState>((state) {
          return state.messages.length == 1 &&
              state.messages.first.text == 'Hi! How can I help?' &&
              state.messages.first.isUser == false;
        }),
      ],
    );

    blocTest<MessageBloc, MessageState>(
      'maintains message order (newest last)',
      build: () => MessageBloc(networkService: mockNetworkService),
      setUp: () {
        when(() => mockNetworkService.sendJson(any())).thenReturn(null);
      },
      act: (bloc) => bloc
        ..add(const MessageSent('First'))
        ..add(MessageReceived(Message(
          id: '2',
          text: 'Second',
          isUser: false,
          timestamp: DateTime(2026, 2, 6, 10, 1),
        )))
        ..add(const MessageSent('Third')),
      expect: () => [
        predicate<MessageState>((state) => state.messages.length == 1),
        predicate<MessageState>((state) => state.messages.length == 2),
        predicate<MessageState>((state) {
          return state.messages.length == 3 &&
              state.messages[0].text == 'First' &&
              state.messages[1].text == 'Second' &&
              state.messages[2].text == 'Third';
        }),
      ],
    );

    blocTest<MessageBloc, MessageState>(
      'clears all messages when MessagesCleared is added',
      build: () => MessageBloc(networkService: mockNetworkService),
      seed: () => MessageState(
        messages: [
          Message(
            id: '1',
            text: 'Test',
            isUser: true,
            timestamp: DateTime.now(),
          ),
        ],
      ),
      act: (bloc) => bloc.add(const MessagesCleared()),
      expect: () => [
        const MessageState(messages: []),
      ],
    );

    blocTest<MessageBloc, MessageState>(
      'deletes specific message when MessageDeleted is added',
      build: () => MessageBloc(networkService: mockNetworkService),
      seed: () => MessageState(
        messages: [
          Message(
            id: '1',
            text: 'Keep this',
            isUser: true,
            timestamp: DateTime.now(),
          ),
          Message(
            id: '2',
            text: 'Delete this',
            isUser: false,
            timestamp: DateTime.now(),
          ),
        ],
      ),
      act: (bloc) => bloc.add(const MessageDeleted('2')),
      expect: () => [
        predicate<MessageState>((state) {
          return state.messages.length == 1 &&
              state.messages.first.id == '1';
        }),
      ],
    );

    blocTest<MessageBloc, MessageState>(
      'updates lastMessage correctly',
      build: () => MessageBloc(networkService: mockNetworkService),
      setUp: () {
        when(() => mockNetworkService.sendJson(any())).thenReturn(null);
      },
      act: (bloc) => bloc
        ..add(const MessageSent('First message'))
        ..add(MessageReceived(Message(
          id: '2',
          text: 'Last message',
          isUser: false,
          timestamp: DateTime.now(),
        ))),
      verify: (bloc) {
        expect(bloc.state.lastMessage?.text, equals('Last message'));
      },
    );
  });
}
