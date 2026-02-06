import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:friday_voice_app/widgets/chat_bubble.dart';
import 'package:friday_voice_app/models/message.dart';

/// Golden tests for ChatBubble widget.
void main() {
  group('ChatBubble Golden Tests', () {
    testWidgets('user message golden', (WidgetTester tester) async {
      final message = Message(
        id: '1',
        content: 'Hello Friday!',
        role: MessageRole.user,
        timestamp: DateTime(2026, 2, 6, 18, 0),
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ChatBubble(message: message),
          ),
        ),
      );

      await tester.pumpAndSettle();
      await expectLater(
        find.byType(ChatBubble),
        matchesGoldenFile('goldens/chat_bubble_user.png'),
      );
    });

    testWidgets('assistant message golden', (WidgetTester tester) async {
      final message = Message(
        id: '2',
        content: 'Hej! Hvordan kan jeg hjælpe dig?',
        role: MessageRole.assistant,
        timestamp: DateTime(2026, 2, 6, 18, 0),
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ChatBubble(message: message),
          ),
        ),
      );

      await tester.pumpAndSettle();
      await expectLater(
        find.byType(ChatBubble),
        matchesGoldenFile('goldens/chat_bubble_assistant.png'),
      );
    });

    testWidgets('long message golden', (WidgetTester tester) async {
      final message = Message(
        id: '3',
        content: 'Dette er en meget lang besked der skal vise hvordan '
            'chat boblen håndterer tekst der wrapper over flere linjer. '
            'Det er vigtigt at teste dette for at sikre at layoutet ser '
            'godt ud uanset beskedens længde.',
        role: MessageRole.assistant,
        timestamp: DateTime(2026, 2, 6, 18, 0),
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Container(
              width: 400,
              padding: const EdgeInsets.all(16),
              child: ChatBubble(message: message),
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();
      await expectLater(
        find.byType(Container),
        matchesGoldenFile('goldens/chat_bubble_long.png'),
      );
    });

    testWidgets('conversation golden', (WidgetTester tester) async {
      final messages = [
        Message(
          id: '1',
          content: 'Hvad er vejret i dag?',
          role: MessageRole.user,
          timestamp: DateTime(2026, 2, 6, 18, 0),
        ),
        Message(
          id: '2',
          content: 'I dag er det solrigt med temperaturer omkring 15 grader.',
          role: MessageRole.assistant,
          timestamp: DateTime(2026, 2, 6, 18, 0, 5),
        ),
        Message(
          id: '3',
          content: 'Perfekt! Tak.',
          role: MessageRole.user,
          timestamp: DateTime(2026, 2, 6, 18, 0, 10),
        ),
      ];

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Container(
              width: 400,
              padding: const EdgeInsets.all(16),
              child: Column(
                children: messages
                    .map((msg) => Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: ChatBubble(message: msg),
                        ))
                    .toList(),
              ),
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();
      await expectLater(
        find.byType(Column),
        matchesGoldenFile('goldens/chat_bubble_conversation.png'),
      );
    });
  });
}
