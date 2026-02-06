import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/app_theme.dart';

/// Glass-style button with hover effects
class GlassButton extends StatefulWidget {
  final IconData icon;
  final String label;
  final VoidCallback? onPressed;
  final bool isPrimary;
  
  const GlassButton({
    super.key,
    required this.icon,
    required this.label,
    this.onPressed,
    this.isPrimary = false,
  });
  
  @override
  State<GlassButton> createState() => _GlassButtonState();
}

class _GlassButtonState extends State<GlassButton> {
  bool _isHovered = false;
  
  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: GestureDetector(
        onTap: widget.onPressed != null
          ? () {
              HapticFeedback.mediumImpact();
              widget.onPressed!();
            }
          : null,
        child: AnimatedContainer(
          duration: AppTheme.mediumDuration,
          curve: AppTheme.easeSmooth,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            gradient: widget.isPrimary
              ? AppTheme.primaryGradient
              : AppTheme.glassGradient,
            border: Border.all(
              color: _isHovered
                ? AppTheme.accentFrom.withOpacity(0.5)
                : AppTheme.glassBorder,
              width: 1,
            ),
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              if (widget.isPrimary)
                BoxShadow(
                  color: AppTheme.accentFrom.withOpacity(0.3),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                ),
              if (_isHovered && !widget.isPrimary)
                BoxShadow(
                  color: AppTheme.accentFrom.withOpacity(0.2),
                  blurRadius: 24,
                  offset: const Offset(0, 8),
                ),
            ],
          ),
          transform: Matrix4.translationValues(
            0,
            _isHovered ? -2 : 0,
            0,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                widget.icon,
                color: Colors.white.withOpacity(0.9),
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                widget.label,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: Colors.white.withOpacity(0.9),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Primary action button with gradient
class MicButton extends StatelessWidget {
  final VoidCallback? onPressed;
  final IconData icon;
  final String label;
  
  const MicButton({
    super.key,
    required this.onPressed,
    required this.icon,
    required this.label,
  });
  
  @override
  Widget build(BuildContext context) {
    return GlassButton(
      icon: icon,
      label: label,
      onPressed: onPressed,
      isPrimary: true,
    );
  }
}
