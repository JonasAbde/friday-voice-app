import 'package:flutter/material.dart';

/// Friday Voice App Theme
class AppTheme {
  // Private constructor to prevent instantiation
  AppTheme._();
  
  /// Color constants
  static const Color accentFrom = Color(0xFF667EEA); // Soft purple
  static const Color accentTo = Color(0xFF764BA2);   // Deep purple
  static const Color bgDark = Color(0xFF0A0A0F);
  static const Color bgGradientStart = Color(0xFF1A1A2E);
  
  /// Status colors
  static const Color statusConnected = Color(0xFF10B981);
  static const Color statusListening = Color(0xFF667EEA);
  static const Color statusProcessing = Color(0xFF764BA2);
  static const Color statusError = Color(0xFFEF4444);
  
  /// Glass effect colors
  static final Color glassLight = Colors.white.withOpacity(0.05);
  static final Color glassBorder = Colors.white.withOpacity(0.1);
  static final Color glassGlow = const Color(0xFF667EEA).withOpacity(0.1);
  
  /// Main dark theme
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      
      // Color scheme
      colorScheme: ColorScheme.fromSeed(
        seedColor: accentFrom,
        brightness: Brightness.dark,
        primary: accentFrom,
        secondary: accentTo,
        surface: bgDark,
      ),
      
      // Typography
      textTheme: const TextTheme(
        headlineLarge: TextStyle(
          fontSize: 48,
          fontWeight: FontWeight.w600,
          letterSpacing: -0.02,
        ),
        headlineMedium: TextStyle(
          fontSize: 24,
          fontWeight: FontWeight.w600,
          letterSpacing: -0.01,
        ),
        bodyLarge: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w400,
          letterSpacing: 0,
        ),
        bodyMedium: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w400,
          letterSpacing: 0.01,
        ),
        bodySmall: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w400,
          letterSpacing: 0.02,
        ),
      ),
      
      // Font family
      fontFamily: 'Inter',
      
      // Card theme
      cardTheme: CardTheme(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
        ),
        elevation: 0,
      ),
      
      // Button themes
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size(44, 44), // Accessibility
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        ),
      ),
      
      // FAB theme
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(16)),
        ),
        elevation: 8,
      ),
      
      // Chip theme
      chipTheme: ChipThemeData(
        backgroundColor: accentFrom.withOpacity(0.1),
        side: BorderSide(
          color: accentFrom.withOpacity(0.3),
          width: 1,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        labelStyle: TextStyle(
          color: Colors.white.withOpacity(0.9),
          fontSize: 13,
          fontWeight: FontWeight.w500,
        ),
      ),
      
      // Slider theme
      sliderTheme: SliderThemeData(
        activeTrackColor: accentFrom,
        inactiveTrackColor: Colors.white.withOpacity(0.1),
        thumbColor: accentFrom,
        overlayColor: accentFrom.withOpacity(0.2),
        trackHeight: 4,
        thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 10),
      ),
    );
  }
  
  /// Gradient for primary actions
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [accentFrom, accentTo],
  );
  
  /// Gradient for glass cards
  static LinearGradient glassGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [
      Colors.white.withOpacity(0.08),
      Colors.white.withOpacity(0.02),
    ],
  );
  
  /// Background gradient
  static const RadialGradient backgroundGradient = RadialGradient(
    center: Alignment.topCenter,
    radius: 1.5,
    colors: [
      bgGradientStart,
      bgDark,
    ],
  );
  
  /// Animation curves
  static const Curve easeSmooth = Curves.easeInOut;
  static const Curve easeBounce = Curves.elasticOut;
  
  /// Animation durations
  static const Duration shortDuration = Duration(milliseconds: 200);
  static const Duration mediumDuration = Duration(milliseconds: 300);
  static const Duration longDuration = Duration(milliseconds: 400);
}
