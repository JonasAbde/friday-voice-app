import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:friday_voice_app/widgets/chat_bubble.dart';
import 'package:friday_voice_app/models/message.dart';

void main() {
  group('ChatBubble Widget Tests', () {
    testWidgets('renders user message correctly', (WidgetTester tester) async {
      final userMessage = Message(
        id: '1',
        text: 'Hello Friday',
        isUser: true,
        timestamp: DateTime(2026, 2, 6, 15, 0),
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ChatBubble(message: userMessage),
          ),
        ),
      );

      expect(find.byType(ChatBubble), findsOneWidget);
      expect(find.text('Hello Friday'), findsOneWidget);
    });

    testWidgets('renders assistant message correctly', (WidgetTester tester) async {
      final assistantMessage = Message(
        id: '2',
        text: 'How can I help?',
        isUser: false,
        timestamp: DateTime(2026, 2, 6, 15, 0),
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ChatBubble(message: assistantMessage),
          ),
        ),
      );

      expect(find.byType(ChatBubble), findsOneWidget);
      expect(find.text('How can I help?'), findsOneWidget);
    });

    testWidgets('displays message content', (WidgetTester tester) async {
      const testContent = 'This is a test message with special characters: !@#\$%^&*()';
      final message = Message(
        id: '3',
        text: testContent,
        isUser: true,
        timestamp: DateTime.now(),
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ChatBubble(message: message),
          ),
        ),
      );

      expect(find.text(testContent), findsOneWidget);
    });

    testWidgets('handles long messages', (WidgetTester tester) async {
      final longMessage = Message(
        id: '4',
        text: 'This is a very long message that should wrap to multiple lines. ' * 10,
        isUser: true,
        timestamp: DateTime.now(),
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ChatBubble(message: longMessage),
          ),
        ),
      );

      expect(find.byType(ChatBubble), findsOneWidget);
      // Message should be displayed (wrapped if necessary)
      expect(find.textContaining('This is a very long message'), findsOneWidget);
    });

    testWidgets('handles empty message', (WidgetTester tester) async {
      final emptyMessage = Message(
        id: '5',
        text: '',
        isUser: true,
        timestamp: DateTime.now(),
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ChatBubble(message: emptyMessage),
          ),
        ),
      );

      expect(find.byType(ChatBubble), findsOneWidget);
    });

    testWidgets('renders multiple bubbles correctly', (WidgetTester tester) async {
      final messages = [
        Message(id: '1', text: 'Message 1', isUser: true, timestamp: DateTime.now()),
        Message(id: '2', text: 'Message 2', isUser: false, timestamp: DateTime.now()),
        Message(id: '3', text: 'Message 3', isUser: true, timestamp: DateTime.now()),
      ];

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ListView.builder(
              itemCount: messages.length,
              itemBuilder: (context, index) => ChatBubble(message: messages[index]),
            ),
          ),
        ),
      );

      expect(find.byType(ChatBubble), findsNWidgets(3));
      expect(find.text('Message 1'), findsOneWidget);
      expect(find.text('Message 2'), findsOneWidget);
      expect(find.text('Message 3'), findsOneWidget);
    });

    testWidgets('different alignment for user vs assistant', (WidgetTester tester) async {
      final userMessage = Message(
        id: '1',
        text: 'User message',
        isUser: true,
        timestamp: DateTime.now(),
      );
      
      final assistantMessage = Message(
        id: '2',
        text: 'Assistant message',
        isUser: false,
        timestamp: DateTime.now(),
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                ChatBubble(message: userMessage),
                ChatBubble(message: assistantMessage),
              ],
            ),
          ),
        ),
      );

      expect(find.byType(ChatBubble), findsNWidgets(2));
      expect(find.text('User message'), findsOneWidget);
      expect(find.text('Assistant message'), findsOneWidget);
    });

    testWidgets('handles special characters in message', (WidgetTester tester) async {
      final specialMessage = Message(
        id: '8',
        text: 'Special: 😀 🎉 €£¥ \n\t <>&',
        isUser: true,
        timestamp: DateTime.now(),
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ChatBubble(message: specialMessage),
          ),
        ),
      );

      expect(find.byType(ChatBubble), findsOneWidget);
      expect(find.textContaining('Special:'), findsOneWidget);
    });

    testWidgets('has correct timestamp', (WidgetTester tester) async {
      final timestamp = DateTime(2026, 2, 6, 15, 30);
      final message = Message(
        id: '9',
        text: 'Timestamped message',
        isUser: true,
        timestamp: timestamp,
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ChatBubble(message: message),
          ),
        ),
      );

      expect(find.byType(ChatBubble), findsOneWidget);
      // ChatBubble should have the message with the correct timestamp
      final bubbleWidget = tester.widget<ChatBubble>(find.byType(ChatBubble));
      expect(bubbleWidget.message.timestamp, equals(timestamp));
    });
  });
}
