import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'theme/app_theme.dart';
import 'screens/home_screen.dart';
import 'core/error/error_handler.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize error handler
  await ErrorHandler.initialize();
  
  // Initialize Sentry (use empty DSN for now, replace with real DSN in production)
  await SentryFlutter.init(
    (options) {
      // TODO: Replace with actual Sentry DSN from https://sentry.io
      options.dsn = ''; // Empty DSN = local logging only
      options.tracesSampleRate = 1.0; // 100% of transactions for development
      options.environment = const String.fromEnvironment(
        'SENTRY_ENVIRONMENT',
        defaultValue: 'development',
      );
      options.release = 'friday-voice-app@0.2.2';
      options.dist = '2';
      options.beforeSend = (event, hint) {
        // Filter out sensitive data before sending to Sentry
        // Add custom logic here if needed
        return event;
      };
    },
    appRunner: () => runAppWithErrorHandling(),
  );
}

void runAppWithErrorHandling() {
  // Set system UI overlay style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Colors.transparent,
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );
  
  // Set preferred orientations
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  
  runApp(const FridayVoiceApp());
}

class FridayVoiceApp extends StatelessWidget {
  const FridayVoiceApp({super.key});
  
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Friday - AI Voice Assistant',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const HomeScreen(),
      // Wrap navigation observer with Sentry
      navigatorObservers: [
        SentryNavigatorObserver(),
      ],
    );
  }
}
