import 'dart:async';
import 'dart:io';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/services.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:flutter_tts/flutter_tts.dart';
import 'package:record/record.dart';
import 'package:permission_handler/permission_handler.dart';

/// VoiceService - Unified voice interaction service for Friday
/// 
/// Supports speech-to-text, text-to-speech, and audio recording
/// across Android, iOS, and Web platforms with ElevenLabs integration.
class VoiceService {
  // Platform channels for ElevenLabs integration
  static const _elevenLabsChannel = MethodChannel('com.friday/elevenlabs');
  
  // Core services
  late stt.SpeechToText _speechToText;
  late FlutterTts _flutterTts;
  late AudioRecorder _recorder;
  
  // State management
  bool _isInitialized = false;
  bool _isRecording = false;
  bool _isListening = false;
  bool _isSpeaking = false;
  
  // Configuration
  String _selectedLocale = 'da-DK'; // Danish default
  double _speechRate = 1.0;
  double _pitch = 1.0;
  double _volume = 1.0;
  
  // ElevenLabs configuration
  String? _elevenLabsApiKey;
  String? _elevenLabsVoiceId;
  bool _useElevenLabs = false;
  
  // Callbacks
  VoidCallback? _onListeningStart;
  VoidCallback? _onListeningStop;
  Function(String)? _onTranscription;
  Function(String)? _onError;
  Function(double)? _onAmplitude;
  
  // Getters for state
  bool get isInitialized => _isInitialized;
  bool get isRecording => _isRecording;
  bool get isListening => _isListening;
  bool get isSpeaking => _isSpeaking;
  
  VoiceService() {
    _speechToText = stt.SpeechToText();
    _flutterTts = FlutterTts();
    _recorder = AudioRecorder();
  }
  
  /// Initialize the voice service
  /// 
  /// Returns true if initialization was successful
  /// Handles permission requests and platform-specific setup
  Future<bool> initialize({
    String locale = 'da-DK',
    String? elevenLabsApiKey,
    String? elevenLabsVoiceId,
    bool useElevenLabs = false,
    VoidCallback? onListeningStart,
    VoidCallback? onListeningStop,
    Function(String)? onTranscription,
    Function(String)? onError,
    Function(double)? onAmplitude,
  }) async {
    if (_isInitialized) return true;
    
    try {
      // Store configuration
      _selectedLocale = locale;
      _elevenLabsApiKey = elevenLabsApiKey;
      _elevenLabsVoiceId = elevenLabsVoiceId;
      _useElevenLabs = useElevenLabs && elevenLabsApiKey != null;
      _onListeningStart = onListeningStart;
      _onListeningStop = onListeningStop;
      _onTranscription = onTranscription;
      _onError = onError;
      _onAmplitude = onAmplitude;
      
      // Request microphone permission
      final permissionGranted = await _requestMicrophonePermission();
      if (!permissionGranted) {
        _onError?.call('Microphone permission denied');
        return false;
      }
      
      // Initialize speech-to-text
      final sttAvailable = await _speechToText.initialize(
        onStatus: _handleSpeechStatus,
        onError: _handleSpeechError,
      );
      
      if (!sttAvailable) {
        _onError?.call('Speech recognition not available');
        return false;
      }
      
      // Initialize text-to-speech
      await _initializeTts();
      
      // Initialize ElevenLabs if configured
      if (_useElevenLabs) {
        await _initializeElevenLabs();
      }
      
      _isInitialized = true;
      return true;
      
    } catch (e) {
      _onError?.call('Initialization failed: $e');
      return false;
    }
  }
  
  /// Request microphone permission with graceful handling
  Future<bool> _requestMicrophonePermission() async {
    if (kIsWeb) {
      // Web permissions are handled by browser
      return true;
    }
    
    final status = await Permission.microphone.status;
    
    if (status.isGranted) {
      return true;
    }
    
    if (status.isDenied) {
      // Request permission
      final result = await Permission.microphone.request();
      return result.isGranted;
    }
    
    if (status.isPermanentlyDenied) {
      // Open app settings
      _onError?.call('Microphone permission permanently denied. Please enable in settings.');
      await openAppSettings();
      return false;
    }
    
    return false;
  }
  
  /// Initialize TTS with platform-specific settings
  Future<void> _initializeTts() async {
    await _flutterTts.setLanguage(_selectedLocale);
    await _flutterTts.setSpeechRate(_speechRate);
    await _flutterTts.setPitch(_pitch);
    await _flutterTts.setVolume(_volume);
    
    // iOS-specific configuration for better audio session handling
    if (Platform.isIOS) {
      await _flutterTts.setSharedInstance(true);
      await _flutterTts.setIosAudioCategory(
        IosTextToSpeechAudioCategory.playback,
        [
          IosTextToSpeechAudioCategoryOptions.allowBluetooth,
          IosTextToSpeechAudioCategoryOptions.allowBluetoothA2DP,
          IosTextToSpeechAudioCategoryOptions.mixWithOthers,
        ],
        IosTextToSpeechAudioMode.voicePrompt,
      );
    }
    
    // Set up completion handlers
    _flutterTts.setStartHandler(() {
      _isSpeaking = true;
    });
    
    _flutterTts.setCompletionHandler(() {
      _isSpeaking = false;
    });
    
    _flutterTts.setErrorHandler((msg) {
      _isSpeaking = false;
      _onError?.call('TTS error: $msg');
    });
  }
  
  /// Initialize ElevenLabs platform channels
  Future<void> _initializeElevenLabs() async {
    try {
      await _elevenLabsChannel.invokeMethod('initialize', {
        'apiKey': _elevenLabsApiKey,
        'voiceId': _elevenLabsVoiceId,
      });
    } catch (e) {
      _onError?.call('ElevenLabs initialization failed: $e. Falling back to local TTS.');
      _useElevenLabs = false;
    }
  }
  
  /// Start recording audio to buffer
  /// 
  /// Low latency implementation (<500ms startup)
  /// Returns true if recording started successfully
  Future<bool> startRecording() async {
    if (!_isInitialized || _isRecording) return false;
    
    try {
      final hasPermission = await _recorder.hasPermission();
      if (!hasPermission) {
        _onError?.call('Recording permission denied');
        return false;
      }
      
      // Start recording to stream for low latency
      await _recorder.start(
        const RecordConfig(
          encoder: AudioEncoder.pcm16bits,
          sampleRate: 16000,
          numChannels: 1,
        ),
      );
      
      _isRecording = true;
      _onListeningStart?.call();
      
      // Monitor amplitude if callback provided
      if (_onAmplitude != null) {
        _startAmplitudeMonitoring();
      }
      
      return true;
      
    } catch (e) {
      _onError?.call('Failed to start recording: $e');
      return false;
    }
  }
  
  /// Stop recording and return audio buffer
  /// 
  /// Returns path to recorded audio file or null if failed
  Future<String?> stopRecording() async {
    if (!_isRecording) return null;
    
    try {
      final path = await _recorder.stop();
      _isRecording = false;
      _onListeningStop?.call();
      return path;
      
    } catch (e) {
      _onError?.call('Failed to stop recording: $e');
      _isRecording = false;
      return null;
    }
  }
  
  /// Monitor audio amplitude during recording
  void _startAmplitudeMonitoring() {
    // Amplitude monitoring implementation
    // Note: This requires platform-specific implementation
    // or additional packages like flutter_sound
  }
  
  /// Start listening for speech and transcribe in real-time
  /// 
  /// Uses device's native speech recognition
  Future<bool> startListening({
    String? localeId,
    Duration? listenTimeout,
    Duration? pauseTimeout,
  }) async {
    if (!_isInitialized || _isListening) return false;
    
    try {
      await _speechToText.listen(
        onResult: _handleSpeechResult,
        localeId: localeId ?? _selectedLocale,
        listenFor: listenTimeout ?? const Duration(seconds: 30),
        pauseFor: pauseTimeout ?? const Duration(seconds: 5),
        partialResults: true,
        cancelOnError: true,
        listenMode: stt.ListenMode.confirmation,
      );
      
      _isListening = true;
      _onListeningStart?.call();
      return true;
      
    } catch (e) {
      _onError?.call('Failed to start listening: $e');
      return false;
    }
  }
  
  /// Stop listening for speech
  Future<void> stopListening() async {
    if (!_isListening) return;
    
    await _speechToText.stop();
    _isListening = false;
    _onListeningStop?.call();
  }
  
  /// Cancel listening without processing results
  Future<void> cancelListening() async {
    if (!_isListening) return;
    
    await _speechToText.cancel();
    _isListening = false;
    _onListeningStop?.call();
  }
  
  /// Transcribe audio buffer
  /// 
  /// For pre-recorded audio files
  /// Note: Not all platforms support this
  Future<String?> transcribe(String audioPath) async {
    // iOS supports transcription from file
    // Android does not natively support this
    
    if (Platform.isIOS) {
      try {
        // iOS-specific implementation would go here
        // This requires additional native code
        _onError?.call('File transcription requires native implementation');
        return null;
      } catch (e) {
        _onError?.call('Transcription failed: $e');
        return null;
      }
    } else {
      _onError?.call('File transcription not supported on this platform');
      return null;
    }
  }
  
  /// Speak text using TTS or ElevenLabs
  /// 
  /// Automatically falls back to local TTS if ElevenLabs fails
  Future<bool> speak(
    String text, {
    String? voice,
    double? rate,
    double? pitch,
    double? volume,
  }) async {
    if (!_isInitialized || text.isEmpty) return false;
    
    try {
      // Try ElevenLabs first if configured
      if (_useElevenLabs) {
        final success = await _speakWithElevenLabs(text, voice: voice);
        if (success) return true;
        // Fall through to local TTS if ElevenLabs fails
      }
      
      // Use local TTS
      await _speakWithLocalTts(text, rate: rate, pitch: pitch, volume: volume);
      return true;
      
    } catch (e) {
      _onError?.call('Speech failed: $e');
      return false;
    }
  }
  
  /// Speak using ElevenLabs API via platform channel
  Future<bool> _speakWithElevenLabs(String text, {String? voice}) async {
    try {
      await _elevenLabsChannel.invokeMethod('speak', {
        'text': text,
        'voiceId': voice ?? _elevenLabsVoiceId,
      });
      return true;
    } catch (e) {
      _onError?.call('ElevenLabs speech failed: $e. Falling back to local TTS.');
      return false;
    }
  }
  
  /// Speak using local TTS
  Future<void> _speakWithLocalTts(
    String text, {
    double? rate,
    double? pitch,
    double? volume,
  }) async {
    if (rate != null) await _flutterTts.setSpeechRate(rate);
    if (pitch != null) await _flutterTts.setPitch(pitch);
    if (volume != null) await _flutterTts.setVolume(volume);
    
    await _flutterTts.speak(text);
  }
  
  /// Stop speaking
  Future<void> stopSpeaking() async {
    await _flutterTts.stop();
    _isSpeaking = false;
  }
  
  /// Detect wake word (e.g., "Hey Friday")
  /// 
  /// This is a placeholder for wake word detection
  /// Recommended: Use picovoice_flutter for production
  Future<bool> detectWakeWord() async {
    // Wake word detection requires:
    // 1. Continuous audio monitoring
    // 2. Low-power implementation
    // 3. Offline model (Picovoice Porcupine recommended)
    
    // For now, return false - implement with picovoice_flutter
    _onError?.call('Wake word detection requires picovoice_flutter package');
    return false;
  }
  
  /// Get available languages for speech recognition
  Future<List<stt.LocaleName>> getAvailableLocales() async {
    if (!_isInitialized) return [];
    return await _speechToText.locales();
  }
  
  /// Get available voices for TTS
  Future<List<dynamic>> getAvailableVoices() async {
    if (!_isInitialized) return [];
    return await _flutterTts.getVoices;
  }
  
  /// Set TTS voice
  Future<void> setVoice(Map<String, String> voice) async {
    await _flutterTts.setVoice(voice);
  }
  
  /// Handle speech recognition status changes
  void _handleSpeechStatus(String status) {
    if (status == 'listening') {
      _onListeningStart?.call();
    } else if (status == 'notListening' || status == 'done') {
      _onListeningStop?.call();
    }
  }
  
  /// Handle speech recognition errors
  void _handleSpeechError(dynamic error) {
    _onError?.call('Speech recognition error: ${error.errorMsg}');
    _isListening = false;
    _onListeningStop?.call();
  }
  
  /// Handle speech recognition results
  void _handleSpeechResult(stt.SpeechRecognitionResult result) {
    if (result.finalResult) {
      _onTranscription?.call(result.recognizedWords);
    }
  }
  
  /// Dispose resources
  Future<void> dispose() async {
    await stopListening();
    await stopRecording();
    await stopSpeaking();
    await _recorder.dispose();
    _isInitialized = false;
  }
}
