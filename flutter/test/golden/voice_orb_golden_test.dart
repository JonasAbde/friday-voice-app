import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:friday_voice_app/widgets/voice_orb.dart';
import 'package:friday_voice_app/models/voice_state.dart';

/// Golden tests for VoiceOrb widget.
/// 
/// Compares rendered widget screenshots against baseline images.
void main() {
  group('VoiceOrb Golden Tests', () {
    testWidgets('idle state golden', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Center(
              child: VoiceOrb(
                state: VoiceStatus.idle,
                size: 200,
              ),
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();
      await expectLater(
        find.byType(VoiceOrb),
        matchesGoldenFile('goldens/voice_orb_idle.png'),
      );
    });

    testWidgets('listening state golden', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Center(
              child: VoiceOrb(
                state: VoiceStatus.listening,
                size: 200,
              ),
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();
      await expectLater(
        find.byType(VoiceOrb),
        matchesGoldenFile('goldens/voice_orb_listening.png'),
      );
    });

    testWidgets('processing state golden', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Center(
              child: VoiceOrb(
                state: VoiceStatus.processing,
                size: 200,
              ),
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();
      await expectLater(
        find.byType(VoiceOrb),
        matchesGoldenFile('goldens/voice_orb_processing.png'),
      );
    });

    testWidgets('speaking state golden', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Center(
              child: VoiceOrb(
                state: VoiceStatus.speaking,
                size: 200,
              ),
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();
      await expectLater(
        find.byType(VoiceOrb),
        matchesGoldenFile('goldens/voice_orb_speaking.png'),
      );
    });

    testWidgets('different sizes golden', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: const [
                VoiceOrb(state: VoiceStatus.idle, size: 100),
                VoiceOrb(state: VoiceStatus.idle, size: 150),
                VoiceOrb(state: VoiceStatus.idle, size: 200),
              ],
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();
      await expectLater(
        find.byType(Row),
        matchesGoldenFile('goldens/voice_orb_sizes.png'),
      );
    });
  });
}
