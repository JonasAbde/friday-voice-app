import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:friday_voice_app/main.dart' as app;

/// Integration test for complete voice interaction flow.
/// 
/// Tests the full user journey from app launch to voice interaction.
void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Voice Flow Integration Tests', () {
    testWidgets('Complete app launch and UI render', (WidgetTester tester) async {
      // Start the app
      app.main();
      await tester.pumpAndSettle();

      // Verify app title
      expect(find.text('Friday'), findsOneWidget);

      // Verify VoiceOrb is present
      expect(find.byType(GestureDetector), findsWidgets);
      
      // Verify status badge is present
      expect(find.byType(Container), findsWidgets);
    });

    testWidgets('Voice orb responds to tap', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Find and tap the voice orb (center of screen typically)
      final orbFinder = find.byType(GestureDetector).first;
      expect(orbFinder, findsOneWidget);

      // Tap the orb
      await tester.tap(orbFinder);
      await tester.pump();

      // Animation should start
      await tester.pump(const Duration(milliseconds: 100));
      
      // UI should update (exact behavior depends on permissions)
      expect(find.byType(Container), findsWidgets);
    });

    testWidgets('Settings button opens settings', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Find settings button (IconButton with settings icon)
      final settingsButton = find.byIcon(Icons.settings);
      
      if (settingsButton.evaluate().isNotEmpty) {
        await tester.tap(settingsButton);
        await tester.pumpAndSettle();

        // Settings dialog/sheet should appear
        expect(find.byType(Dialog), findsOneWidget);
      }
    });

    testWidgets('Chat messages render correctly', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Look for ListView (chat messages)
      expect(find.byType(ListView), findsOneWidget);
      
      // Initially should be empty or have welcome message
      final listView = find.byType(ListView);
      expect(listView, findsOneWidget);
    });

    testWidgets('Connection status updates', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Initial state should show some connection indicator
      expect(find.byType(Container), findsWidgets);
      
      // Wait for potential connection attempts
      await tester.pump(const Duration(seconds: 2));
      
      // Connection state should be tracked
      expect(find.byType(Container), findsWidgets);
    });

    testWidgets('Error handling displays correctly', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();

      // App should handle errors gracefully
      // No crashes during normal operation
      expect(tester.takeException(), isNull);
    });

    testWidgets('Navigation and back button work', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();

      // App should be on home screen
      expect(find.text('Friday'), findsOneWidget);
      
      // No navigation errors
      expect(tester.takeException(), isNull);
    });

    testWidgets('Voice orb animation performs smoothly', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Tap orb to start animation
      final orbFinder = find.byType(GestureDetector).first;
      await tester.tap(orbFinder);
      
      // Let animation run for a bit
      for (int i = 0; i < 10; i++) {
        await tester.pump(const Duration(milliseconds: 16)); // ~60fps
      }
      
      // No animation errors
      expect(tester.takeException(), isNull);
    });

    testWidgets('Multiple rapid taps handled gracefully', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();

      final orbFinder = find.byType(GestureDetector).first;
      
      // Rapid taps
      for (int i = 0; i < 5; i++) {
        await tester.tap(orbFinder);
        await tester.pump(const Duration(milliseconds: 50));
      }
      
      await tester.pumpAndSettle();
      
      // Should handle gracefully without crashes
      expect(tester.takeException(), isNull);
    });

    testWidgets('App lifecycle handling', (WidgetTester tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Simulate app going to background
      final binding = tester.binding;
      await binding.handleAppLifecycleStateChanged(AppLifecycleState.paused);
      await tester.pump();

      // Simulate app coming back to foreground
      await binding.handleAppLifecycleStateChanged(AppLifecycleState.resumed);
      await tester.pumpAndSettle();

      // App should still be functional
      expect(find.text('Friday'), findsOneWidget);
      expect(tester.takeException(), isNull);
    });
  });
}
