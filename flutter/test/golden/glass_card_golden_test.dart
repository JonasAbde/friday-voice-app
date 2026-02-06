import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:friday_voice_app/widgets/glass_card.dart';

/// Golden tests for GlassCard widget.
void main() {
  group('GlassCard Golden Tests', () {
    testWidgets('default glass card golden', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            backgroundColor: Colors.blue,
            body: Center(
              child: GlassCard(
                child: Container(
                  width: 200,
                  height: 100,
                  alignment: Alignment.center,
                  child: const Text(
                    'Glass Card',
                    style: TextStyle(color: Colors.white, fontSize: 18),
                  ),
                ),
              ),
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();
      await expectLater(
        find.byType(Scaffold),
        matchesGoldenFile('goldens/glass_card_default.png'),
      );
    });

    testWidgets('glass card with custom blur golden', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            backgroundColor: Colors.purple,
            body: Center(
              child: GlassCard(
                blurAmount: 20.0,
                child: Container(
                  width: 200,
                  height: 100,
                  alignment: Alignment.center,
                  child: const Text(
                    'High Blur',
                    style: TextStyle(color: Colors.white, fontSize: 18),
                  ),
                ),
              ),
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();
      await expectLater(
        find.byType(Scaffold),
        matchesGoldenFile('goldens/glass_card_high_blur.png'),
      );
    });

    testWidgets('glass card with custom border radius golden', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            backgroundColor: Colors.teal,
            body: Center(
              child: GlassCard(
                borderRadius: 32.0,
                child: Container(
                  width: 200,
                  height: 100,
                  alignment: Alignment.center,
                  child: const Text(
                    'Round Card',
                    style: TextStyle(color: Colors.white, fontSize: 18),
                  ),
                ),
              ),
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();
      await expectLater(
        find.byType(Scaffold),
        matchesGoldenFile('goldens/glass_card_round.png'),
      );
    });

    testWidgets('multiple glass cards golden', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            backgroundColor: Colors.indigo,
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  GlassCard(
                    child: Container(
                      width: 150,
                      height: 80,
                      alignment: Alignment.center,
                      child: const Text('Card 1', style: TextStyle(color: Colors.white)),
                    ),
                  ),
                  const SizedBox(height: 16),
                  GlassCard(
                    child: Container(
                      width: 150,
                      height: 80,
                      alignment: Alignment.center,
                      child: const Text('Card 2', style: TextStyle(color: Colors.white)),
                    ),
                  ),
                  const SizedBox(height: 16),
                  GlassCard(
                    child: Container(
                      width: 150,
                      height: 80,
                      alignment: Alignment.center,
                      child: const Text('Card 3', style: TextStyle(color: Colors.white)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();
      await expectLater(
        find.byType(Scaffold),
        matchesGoldenFile('goldens/glass_card_multiple.png'),
      );
    });
  });
}
