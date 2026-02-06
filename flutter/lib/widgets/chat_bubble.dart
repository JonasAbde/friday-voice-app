import 'package:flutter/material.dart';
import '../models/message.dart';
import '../theme/app_theme.dart';

/// Chat message bubble
class ChatBubble extends StatelessWidget {
  final Message message;
  
  const ChatBubble({
    super.key,
    required this.message,
  });
  
  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: message.isUser
        ? Alignment.centerRight
        : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.7,
        ),
        decoration: BoxDecoration(
          gradient: message.isUser
            ? AppTheme.primaryGradient
            : AppTheme.glassGradient,
          borderRadius: BorderRadius.circular(16),
          border: message.isUser
            ? null
            : Border.all(
                color: AppTheme.glassBorder,
                width: 1,
              ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              message.text,
              style: TextStyle(
                fontSize: 14,
                color: Colors.white.withOpacity(0.9),
                height: 1.4,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              _formatTime(message.timestamp),
              style: TextStyle(
                fontSize: 10,
                color: Colors.white.withOpacity(0.4),
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  String _formatTime(DateTime time) {
    return '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
  }
}
