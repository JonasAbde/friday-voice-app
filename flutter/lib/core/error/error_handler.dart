import 'package:flutter/foundation.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

/// Central error handler for the Friday Voice App.
/// 
/// Handles exceptions, logs errors, and reports to Sentry in production.
class ErrorHandler {
  static const String _tag = 'ErrorHandler';
  
  /// Initialize error handling with Sentry integration.
  static Future<void> initialize() async {
    // Set up Flutter error handling
    FlutterError.onError = (FlutterErrorDetails details) {
      FlutterError.presentError(details);
      
      // Log to console in debug mode
      if (kDebugMode) {
        debugPrint('$_tag: Flutter Error - ${details.exception}');
        debugPrint('Stack trace: ${details.stack}');
      }
      
      // Report to Sentry in release mode
      if (kReleaseMode) {
        Sentry.captureException(
          details.exception,
          stackTrace: details.stack,
          hint: Hint.withMap({'context': 'FlutterError'}),
        );
      }
    };
  }
  
  /// Handle and report an error.
  static Future<void> handleError(
    Object error, {
    StackTrace? stackTrace,
    String? context,
    Map<String, dynamic>? extras,
  }) async {
    // Log to console in debug mode
    if (kDebugMode) {
      debugPrint('$_tag: Error in $context - $error');
      if (stackTrace != null) {
        debugPrint('Stack trace: $stackTrace');
      }
      if (extras != null) {
        debugPrint('Extras: $extras');
      }
    }
    
    // Report to Sentry
    await Sentry.captureException(
      error,
      stackTrace: stackTrace,
      hint: Hint.withMap({
        if (context != null) 'context': context,
        if (extras != null) ...extras,
      }),
    );
  }
  
  /// Log a message to Sentry as a breadcrumb.
  static void logBreadcrumb(
    String message, {
    String? category,
    SentryLevel level = SentryLevel.info,
    Map<String, dynamic>? data,
  }) {
    Sentry.addBreadcrumb(
      Breadcrumb(
        message: message,
        category: category ?? 'app',
        level: level,
        data: data,
      ),
    );
  }
  
  /// Set user context for error reports.
  static Future<void> setUser({
    String? id,
    String? username,
    String? email,
  }) async {
    await Sentry.configureScope(
      (scope) => scope.setUser(
        SentryUser(
          id: id,
          username: username,
          email: email,
        ),
      ),
    );
  }
  
  /// Clear user context.
  static Future<void> clearUser() async {
    await Sentry.configureScope(
      (scope) => scope.setUser(null),
    );
  }
  
  /// Set custom context for error reports.
  static Future<void> setContext(String key, Map<String, dynamic> value) async {
    await Sentry.configureScope(
      (scope) => scope.setContexts(key, value),
    );
  }
  
  /// Record a custom event/metric.
  static Future<void> recordEvent(
    String eventName, {
    Map<String, dynamic>? parameters,
  }) async {
    logBreadcrumb(
      eventName,
      category: 'event',
      data: parameters,
    );
  }
}
