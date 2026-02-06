import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/app_theme.dart';

/// Suggestion chips for quick actions
class SuggestionChips extends StatelessWidget {
  final List<String> suggestions;
  final Function(String) onChipTap;
  
  const SuggestionChips({
    super.key,
    required this.suggestions,
    required this.onChipTap,
  });
  
  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      alignment: WrapAlignment.center,
      children: suggestions.asMap().entries.map((entry) {
        final index = entry.key;
        final suggestion = entry.value;
        
        return TweenAnimationBuilder<double>(
          tween: Tween(begin: 0.0, end: 1.0),
          duration: Duration(milliseconds: 300 + (index * 100)),
          curve: Curves.elasticOut,
          builder: (context, value, child) {
            return Transform.scale(
              scale: value,
              child: Opacity(
                opacity: value,
                child: child,
              ),
            );
          },
          child: ActionChip(
            label: Text(suggestion),
            backgroundColor: AppTheme.accentFrom.withOpacity(0.1),
            side: BorderSide(
              color: AppTheme.accentFrom.withOpacity(0.3),
              width: 1,
            ),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            labelStyle: TextStyle(
              color: Colors.white.withOpacity(0.9),
              fontSize: 13,
              fontWeight: FontWeight.w500,
            ),
            onPressed: () {
              HapticFeedback.lightImpact();
              onChipTap(suggestion);
            },
          ),
        );
      }).toList(),
    );
  }
}
