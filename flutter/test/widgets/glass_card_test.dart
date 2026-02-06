import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:friday_voice_app/widgets/glass_card.dart';

void main() {
  group('GlassCard Widget Tests', () {
    testWidgets('renders with default properties', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: GlassCard(
              child: Text('Test Content'),
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
        const MaterialApp(
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
        const MaterialApp(
          home: Scaffold(
            body: GlassCard(
              padding: EdgeInsets.all(20.0),
              child: Text('Padded Content'),
            ),
          ),
        ),
      );

      // Find the Container widget inside GlassCard
      final containerFinder = find.descendant(
        of: find.byType(GlassCard),
        matching: find.byType(Container),
      );

      expect(containerFinder, findsOneWidget);
    });

    testWidgets('applies custom border radius', (WidgetTester tester) async {
      const customRadius = 20.0;
      
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: GlassCard(
              borderRadius: customRadius,
              child: Text('Rounded Card'),
            ),
          ),
        ),
      );

      expect(find.byType(GlassCard), findsOneWidget);
      expect(find.text('Rounded Card'), findsOneWidget);
    });

    testWidgets('renders with custom blur amount', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: GlassCard(
              blurAmount: 15.0,
              child: Text('Custom Blur'),
            ),
          ),
        ),
      );

      expect(find.byType(GlassCard), findsOneWidget);
    });

    testWidgets('renders multiple cards correctly', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                GlassCard(
                  child: Text('Card 1'),
                ),
                GlassCard(
                  child: Text('Card 2'),
                ),
                GlassCard(
                  child: Text('Card 3'),
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
        const MaterialApp(
          home: Scaffold(
            body: GlassCard(
              child: Text('Blurred Card'),
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

    testWidgets('has ClipRRect for rounded corners', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: GlassCard(
              borderRadius: 24.0,
              child: Text('Clipped Card'),
            ),
          ),
        ),
      );

      // Check for ClipRRect widget
      final clipRRectFinder = find.descendant(
        of: find.byType(GlassCard),
        matching: find.byType(ClipRRect),
      );

      expect(clipRRectFinder, findsOneWidget);
    });
  });
}
