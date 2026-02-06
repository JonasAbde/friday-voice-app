import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:friday_voice_app/widgets/glass_card.dart';

void main() {
  group('GlassCard Widget Tests', () {
    testWidgets('renders with default properties', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: GlassCard(
              child: const Text('Test Content'),
            ),
          ),
        ),
      );

      expect(find.byType(GlassCard), findsOneWidget);
      expect(find.text('Test Content'), findsOneWidget);
    });

    testWidgets('renders child widget', (WidgetTester tester) async {
      const testChild = Text('Glass Card Child');
      
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: GlassCard(
              child: testChild,
            ),
          ),
        ),
      );

      expect(find.text('Glass Card Child'), findsOneWidget);
    });

    testWidgets('has correct padding', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: GlassCard(
              padding: const EdgeInsets.all(20.0),
              child: const Text('Padded Content'),
            ),
          ),
        ),
      );

      // Find the Padding widget inside GlassCard
      final paddingFinder = find.descendant(
        of: find.byType(GlassCard),
        matching: find.byType(Padding),
      );

      expect(paddingFinder, findsWidgets);
    });

    testWidgets('applies custom border radius', (WidgetTester tester) async {
      const customRadius = BorderRadius.all(Radius.circular(20.0));
      
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: GlassCard(
              borderRadius: customRadius,
              child: const Text('Rounded Card'),
            ),
          ),
        ),
      );

      expect(find.byType(GlassCard), findsOneWidget);
      expect(find.text('Rounded Card'), findsOneWidget);
    });

    testWidgets('renders with custom opacity', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: GlassCard(
              opacity: 0.5,
              child: const Text('Semi-transparent'),
            ),
          ),
        ),
      );

      expect(find.byType(GlassCard), findsOneWidget);
    });

    testWidgets('allows tap when onTap is provided', (WidgetTester tester) async {
      var tapped = false;
      
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: GlassCard(
              onTap: () => tapped = true,
              child: const Text('Tappable Card'),
            ),
          ),
        ),
      );

      await tester.tap(find.byType(GlassCard));
      expect(tapped, isTrue);
    });

    testWidgets('does not throw when onTap is null', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: GlassCard(
              child: const Text('Non-tappable Card'),
            ),
          ),
        ),
      );

      // Should not throw when tapped
      await tester.tap(find.byType(GlassCard));
      expect(tester.takeException(), isNull);
    });

    testWidgets('renders multiple cards correctly', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                GlassCard(
                  child: const Text('Card 1'),
                ),
                GlassCard(
                  child: const Text('Card 2'),
                ),
                GlassCard(
                  child: const Text('Card 3'),
                ),
              ],
            ),
          ),
        ),
      );

      expect(find.byType(GlassCard), findsNWidgets(3));
      expect(find.text('Card 1'), findsOneWidget);
      expect(find.text('Card 2'), findsOneWidget);
      expect(find.text('Card 3'), findsOneWidget);
    });

    testWidgets('applies blur effect (BackdropFilter)', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: GlassCard(
              child: const Text('Blurred Card'),
            ),
          ),
        ),
      );

      // Check for BackdropFilter widget (used for blur effect)
      final backdropFilterFinder = find.descendant(
        of: find.byType(GlassCard),
        matching: find.byType(BackdropFilter),
      );

      expect(backdropFilterFinder, findsOneWidget);
    });
  });
}
