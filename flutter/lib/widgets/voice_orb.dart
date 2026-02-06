import 'package:flutter/material.dart';
import '../models/voice_state.dart';
import '../theme/app_theme.dart';

/// Animated voice orb (CustomPaint)
class VoiceOrb extends StatefulWidget {
  final VoiceStatus state;
  final double size;
  
  const VoiceOrb({
    super.key,
    required this.state,
    this.size = 200.0,
  });
  
  @override
  State<VoiceOrb> createState() => _VoiceOrbState();
}

class _VoiceOrbState extends State<VoiceOrb> 
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;
  
  @override
  void initState() {
    super.initState();
    _setupAnimation();
  }
  
  void _setupAnimation() {
    final duration = _getDurationForState(widget.state);
    
    _controller = AnimationController(
      vsync: this,
      duration: duration,
    )..repeat(reverse: true);
    
    _animation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    );
  }
  
  @override
  void didUpdateWidget(VoiceOrb oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.state != widget.state) {
      _controller.dispose();
      _setupAnimation();
    }
  }
  
  Duration _getDurationForState(VoiceStatus state) {
    switch (state) {
      case VoiceStatus.idle:
        return const Duration(milliseconds: 4000); // Slow breathe
      case VoiceStatus.listening:
        return const Duration(milliseconds: 1500); // Fast pulse
      case VoiceStatus.processing:
        return const Duration(milliseconds: 2000); // Medium spin
      case VoiceStatus.speaking:
        return const Duration(milliseconds: 1000); // Fast pulse
      case VoiceStatus.error:
        return const Duration(milliseconds: 500); // Very fast (error shake)
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: widget.size,
      height: widget.size,
      child: AnimatedBuilder(
        animation: _animation,
        builder: (context, child) {
          return CustomPaint(
            size: Size(widget.size, widget.size),
            painter: VoiceOrbPainter(
              animationValue: _animation.value,
              state: widget.state,
            ),
          );
        },
      ),
    );
  }
  
  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}

/// Custom painter for voice orb
class VoiceOrbPainter extends CustomPainter {
  final double animationValue;
  final VoiceStatus state;
  
  VoiceOrbPainter({
    required this.animationValue,
    required this.state,
  });
  
  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final baseRadius = size.width / 2 * 0.6;
    
    // Calculate scale based on state
    final scale = _getScaleForState();
    final radius = baseRadius * scale;
    
    // Create radial gradient
    final paint = Paint()
      ..shader = RadialGradient(
        colors: _getColorsForState(),
        center: Alignment.center,
        radius: 0.8,
      ).createShader(Rect.fromCircle(center: center, radius: radius))
      ..maskFilter = MaskFilter.blur(
        BlurStyle.normal,
        _getBlurForState(),
      );
    
    // Draw main orb
    canvas.drawCircle(center, radius, paint);
    
    // Draw inner rings (for listening/processing states)
    if (state == VoiceStatus.listening || state == VoiceStatus.processing) {
      _drawInnerRings(canvas, center, radius);
    }
  }
  
  double _getScaleForState() {
    switch (state) {
      case VoiceStatus.idle:
        // Gentle breathing (5% scale change)
        return 1.0 + (animationValue * 0.05);
      case VoiceStatus.listening:
      case VoiceStatus.speaking:
        // Pulsing (15% scale change)
        return 1.0 + (animationValue * 0.15);
      case VoiceStatus.processing:
        // Constant size (rotation handled separately)
        return 1.0;
      case VoiceStatus.error:
        // Shake effect
        return 1.0 + (animationValue * 0.1);
    }
  }
  
  List<Color> _getColorsForState() {
    switch (state) {
      case VoiceStatus.idle:
        return [
          AppTheme.accentFrom.withOpacity(0.6),
          AppTheme.accentTo.withOpacity(0.8),
        ];
      case VoiceStatus.listening:
      case VoiceStatus.speaking:
        return [
          AppTheme.accentFrom,
          AppTheme.accentTo,
        ];
      case VoiceStatus.processing:
        return [
          AppTheme.accentTo,
          AppTheme.accentFrom,
        ];
      case VoiceStatus.error:
        return [
          Colors.red.withOpacity(0.8),
          Colors.orange.withOpacity(0.8),
        ];
    }
  }
  
  double _getBlurForState() {
    switch (state) {
      case VoiceStatus.idle:
        return 20.0 + (animationValue * 20.0); // 20-40px
      case VoiceStatus.listening:
      case VoiceStatus.speaking:
        return 40.0 + (animationValue * 40.0); // 40-80px
      case VoiceStatus.processing:
        return 60.0; // Constant intense blur
      case VoiceStatus.error:
        return 30.0 + (animationValue * 30.0); // 30-60px
    }
  }
  
  void _drawInnerRings(Canvas canvas, Offset center, double radius) {
    // Draw 3 concentric rings with rotating effect
    for (var i = 0; i < 3; i++) {
      final ringRadius = radius * (0.3 + (i * 0.2));
      final ringPaint = Paint()
        ..color = Colors.white.withOpacity(0.1 - (i * 0.03))
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.0;
      
      canvas.drawCircle(center, ringRadius, ringPaint);
    }
  }
  
  @override
  bool shouldRepaint(VoiceOrbPainter oldDelegate) {
    return oldDelegate.animationValue != animationValue ||
           oldDelegate.state != state;
  }
}
