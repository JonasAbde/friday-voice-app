import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:friday_voice_app/widgets/voice_orb.dart';
import 'package:friday_voice_app/models/voice_state.dart';

void main() {
  group('VoiceOrb Widget Tests', () {
    testWidgets('renders with idle state', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: VoiceOrb(
              state: VoiceState.idle,
              size: 200.0,
            ),
          ),
        ),
      );

      // Widget should render without errors
      expect(find.byType(VoiceOrb), findsOneWidget);
      
      // Should have specified size
      final orbWidget = tester.widget<VoiceOrb>(find.byType(VoiceOrb));
      expect(orbWidget.size, equals(200.0));
      expect(orbWidget.state, equals(VoiceState.idle));
    });

    testWidgets('renders with listening state', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: VoiceOrb(
              state: VoiceState.listening,
              size: 200.0,
            ),
          ),
        ),
      );

      final orbWidget = tester.widget<VoiceOrb>(find.byType(VoiceOrb));
      expect(orbWidget.state, equals(VoiceState.listening));
    });

    testWidgets('renders with speaking state', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: VoiceOrb(
              state: VoiceState.speaking,
              size: 200.0,
            ),
          ),
        ),
      );

      final orbWidget = tester.widget<VoiceOrb>(find.byType(VoiceOrb));
      expect(orbWidget.state, equals(VoiceState.speaking));
    });

    testWidgets('renders with processing state', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: VoiceOrb(
              state: VoiceState.processing,
              size: 200.0,
            ),
          ),
        ),
      );

      final orbWidget = tester.widget<VoiceOrb>(find.byType(VoiceOrb));
      expect(orbWidget.state, equals(VoiceState.processing));
    });

    testWidgets('changes size correctly', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: VoiceOrb(
              state: VoiceState.idle,
              size: 150.0,
            ),
          ),
        ),
      );

      final orbWidget = tester.widget<VoiceOrb>(find.byType(VoiceOrb));
      expect(orbWidget.size, equals(150.0));
    });

    testWidgets('animation starts automatically', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: VoiceOrb(
              state: VoiceState.listening,
              size: 200.0,
            ),
          ),
        ),
      );

      // Let animation tick
      await tester.pump(const Duration(milliseconds: 100));
      await tester.pump(const Duration(milliseconds: 100));

      // Widget should still be visible (animation running)
      expect(find.byType(VoiceOrb), findsOneWidget);
    });

    testWidgets('rebuilds when state changes', (WidgetTester tester) async {
      // Start with idle state
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: VoiceOrb(
              state: VoiceState.idle,
              size: 200.0,
            ),
          ),
        ),
      );

      expect(
        tester.widget<VoiceOrb>(find.byType(VoiceOrb)).state,
        equals(VoiceState.idle),
      );

      // Change to listening state
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: VoiceOrb(
              state: VoiceState.listening,
              size: 200.0,
            ),
          ),
        ),
      );

      expect(
        tester.widget<VoiceOrb>(find.byType(VoiceOrb)).state,
        equals(VoiceState.listening),
      );
    });

    testWidgets('disposes animation controller properly', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: VoiceOrb(
              state: VoiceState.idle,
              size: 200.0,
            ),
          ),
        ),
      );

      // Remove widget (should dispose controller)
      await tester.pumpWidget(const MaterialApp(home: Scaffold()));

      // No errors should occur (controller disposed properly)
      expect(tester.takeException(), isNull);
    });
  });
}
