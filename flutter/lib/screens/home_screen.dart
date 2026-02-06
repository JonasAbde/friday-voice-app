import 'package:flutter/material.dart';
import '../models/voice_state.dart';
import '../models/message.dart';
import '../theme/app_theme.dart';
import '../widgets/voice_orb.dart';
import '../widgets/status_badge.dart';
import '../widgets/glass_card.dart';
import '../widgets/glass_button.dart';
import '../widgets/chat_bubble.dart';
import '../widgets/suggestion_chips.dart';

/// Main home screen with voice interface
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  VoiceState _voiceState = VoiceState.idle;
  final List<Message> _messages = [];
  double _volume = 0.7;
  double _sensitivity = 0.5;
  
  void _toggleVoice() {
    setState(() {
      if (_voiceState == VoiceState.idle) {
        _voiceState = VoiceState.listening;
        // TODO: Start voice recording
      } else {
        _voiceState = VoiceState.idle;
        // TODO: Stop voice recording
      }
    });
  }
  
  void _handleSuggestion(String suggestion) {
    setState(() {
      _messages.add(Message.user(suggestion));
      _voiceState = VoiceState.processing;
    });
    
    // Simulate AI response
    Future.delayed(const Duration(seconds: 2), () {
      setState(() {
        _messages.add(Message.assistant('Processing: $suggestion'));
        _voiceState = VoiceState.idle;
      });
    });
  }
  
  void _showSettings() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _buildSettingsSheet(),
    );
  }
  
  Widget _buildSettingsSheet() {
    return DraggableScrollableSheet(
      initialChildSize: 0.7,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (context, scrollController) {
        return GlassCard(
          borderRadius: 24,
          child: ListView(
            controller: scrollController,
            padding: const EdgeInsets.all(24),
            children: [
              // Drag handle
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              
              Text(
                '⚙️ Indstillinger',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: 24),
              
              // Audio section
              Text('🔊 Lyd', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 16),
              
              ListTile(
                title: const Text('Sprog'),
                trailing: DropdownButton<String>(
                  value: 'Dansk',
                  items: ['Dansk', 'English'].map((lang) {
                    return DropdownMenuItem(value: lang, child: Text(lang));
                  }).toList(),
                  onChanged: (value) {},
                ),
              ),
              
              const SizedBox(height: 24),
              Text('🔧 Avanceret', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 16),
              
              SwitchListTile(
                title: const Text('Debug Mode'),
                value: false,
                onChanged: (value) {},
              ),
            ],
          ),
        );
      },
    );
  }
  
  @override
  Widget build(BuildContext context) {
    final isSmallScreen = MediaQuery.of(context).size.width < 600;
    
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Container(
        decoration: const BoxDecoration(
          gradient: AppTheme.backgroundGradient,
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Status Badge
              const SizedBox(height: 16),
              StatusBadge(state: _voiceState),
              
              // Voice Orb (Center)
              const Spacer(flex: 2),
              VoiceOrb(
                state: _voiceState,
                size: isSmallScreen ? 120 : 200,
              ),
              const SizedBox(height: 16),
              
              // Suggestion Chips
              if (_voiceState == VoiceState.idle)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: SuggestionChips(
                    suggestions: const [
                      '📧 Ny lead',
                      '📅 Bookinger',
                      '💰 Faktura',
                      '🕐 Klokken',
                    ],
                    onChipTap: _handleSuggestion,
                  ),
                ),
              
              const Spacer(flex: 1),
              
              // Chat Container
              if (_messages.isNotEmpty)
                Expanded(
                  flex: 3,
                  child: GlassCard(
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxHeight: 300),
                      child: ListView.builder(
                        reverse: true,
                        shrinkWrap: true,
                        itemCount: _messages.length,
                        itemBuilder: (context, index) {
                          final message = _messages[_messages.length - 1 - index];
                          return TweenAnimationBuilder<double>(
                            tween: Tween(begin: 0.0, end: 1.0),
                            duration: const Duration(milliseconds: 300),
                            builder: (context, value, child) {
                              return Transform.translate(
                                offset: Offset(0, 20 * (1 - value)),
                                child: Opacity(
                                  opacity: value,
                                  child: child,
                                ),
                              );
                            },
                            child: ChatBubble(message: message),
                          );
                        },
                      ),
                    ),
                  ),
                ),
              
              // Controls
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    // Primary button
                    MicButton(
                      icon: _voiceState == VoiceState.idle
                        ? Icons.mic
                        : Icons.stop,
                      label: _voiceState == VoiceState.idle
                        ? 'Start'
                        : 'Stop',
                      onPressed: _toggleVoice,
                    ),
                    
                    const SizedBox(height: 12),
                    
                    // Secondary buttons
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        GlassButton(
                          icon: Icons.replay,
                          label: 'Afspil',
                          onPressed: () {},
                        ),
                        const SizedBox(width: 8),
                        GlassButton(
                          icon: Icons.settings,
                          label: 'Indstillinger',
                          onPressed: _showSettings,
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 16),
                    
                    // Sliders
                    GlassCard(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Lydstyrke',
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                              Text(
                                '${(_volume * 100).toInt()}%',
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                            ],
                          ),
                          Slider(
                            value: _volume,
                            onChanged: (value) {
                              setState(() => _volume = value);
                            },
                          ),
                          
                          const SizedBox(height: 12),
                          
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Mikrofon Følsomhed',
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                              Text(
                                '${(_sensitivity * 100).toInt()}%',
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                            ],
                          ),
                          Slider(
                            value: _sensitivity,
                            onChanged: (value) {
                              setState(() => _sensitivity = value);
                            },
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
