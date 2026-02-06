import Flutter
import UIKit
import AVFoundation

/**
 * ElevenLabsPlugin - iOS implementation for ElevenLabs TTS
 * 
 * Handles API calls to ElevenLabs and audio playback
 * Provides high-quality neural TTS with voice cloning support
 */
public class ElevenLabsPlugin: NSObject, FlutterPlugin {
    private var channel: FlutterMethodChannel?
    private var apiKey: String?
    private var defaultVoiceId: String?
    private var audioPlayer: AVAudioPlayer?
    
    private let baseUrl = "https://api.elevenlabs.io/v1"
    
    public static func register(with registrar: FlutterPluginRegistrar) {
        let channel = FlutterMethodChannel(
            name: "com.friday/elevenlabs",
            binaryMessenger: registrar.messenger()
        )
        let instance = ElevenLabsPlugin()
        instance.channel = channel
        registrar.addMethodCallDelegate(instance, channel: channel)
    }
    
    public func handle(_ call: FlutterMethodCall, result: @escaping FlutterResult) {
        switch call.method {
        case "initialize":
            guard let args = call.arguments as? [String: Any],
                  let apiKey = args["apiKey"] as? String else {
                result(FlutterError(code: "INVALID_ARGS", message: "API key required", details: nil))
                return
            }
            
            self.apiKey = apiKey
            self.defaultVoiceId = args["voiceId"] as? String
            result(true)
            
        case "speak":
            guard let args = call.arguments as? [String: Any],
                  let text = args["text"] as? String else {
                result(FlutterError(code: "INVALID_TEXT", message: "Text required", details: nil))
                return
            }
            
            let voiceId = args["voiceId"] as? String ?? defaultVoiceId
            
            guard let voiceId = voiceId else {
                result(FlutterError(code: "INVALID_VOICE", message: "Voice ID required", details: nil))
                return
            }
            
            synthesizeAndPlay(text: text, voiceId: voiceId, result: result)
            
        case "stop":
            stopPlayback()
            result(true)
            
        case "getVoices":
            getAvailableVoices(result: result)
            
        default:
            result(FlutterMethodNotImplemented)
        }
    }
    
    /**
     * Synthesize speech using ElevenLabs API and play it
     */
    private func synthesizeAndPlay(text: String, voiceId: String, result: @escaping FlutterResult) {
        guard let apiKey = apiKey else {
            result(FlutterError(code: "NOT_INITIALIZED", message: "ElevenLabs not initialized", details: nil))
            return
        }
        
        // Build request
        let url = URL(string: "\(baseUrl)/text-to-speech/\(voiceId)")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue(apiKey, forHTTPHeaderField: "xi-api-key")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body: [String: Any] = [
            "text": text,
            "model_id": "eleven_multilingual_v2",
            "voice_settings": [
                "stability": 0.5,
                "similarity_boost": 0.75
            ]
        ]
        
        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
        } catch {
            result(FlutterError(code: "JSON_ERROR", message: error.localizedDescription, details: nil))
            return
        }
        
        // Make API call
        let task = URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
            if let error = error {
                result(FlutterError(code: "NETWORK_ERROR", message: error.localizedDescription, details: nil))
                return
            }
            
            guard let httpResponse = response as? HTTPURLResponse else {
                result(FlutterError(code: "INVALID_RESPONSE", message: "Invalid response", details: nil))
                return
            }
            
            guard httpResponse.statusCode == 200 else {
                let errorMsg = String(data: data ?? Data(), encoding: .utf8) ?? "Unknown error"
                result(FlutterError(
                    code: "API_ERROR",
                    message: "HTTP \(httpResponse.statusCode): \(errorMsg)",
                    details: nil
                ))
                return
            }
            
            guard let audioData = data else {
                result(FlutterError(code: "NO_DATA", message: "No audio data received", details: nil))
                return
            }
            
            // Play audio
            DispatchQueue.main.async {
                self?.playAudio(data: audioData, result: result)
            }
        }
        
        task.resume()
    }
    
    /**
     * Play audio data using AVAudioPlayer
     */
    private func playAudio(data: Data, result: @escaping FlutterResult) {
        do {
            // Configure audio session
            let audioSession = AVAudioSession.sharedInstance()
            try audioSession.setCategory(.playback, mode: .voicePrompt, options: [.mixWithOthers])
            try audioSession.setActive(true)
            
            // Create and play audio
            audioPlayer = try AVAudioPlayer(data: data)
            audioPlayer?.prepareToPlay()
            audioPlayer?.play()
            
            result(true)
            
        } catch {
            result(FlutterError(code: "PLAYBACK_ERROR", message: error.localizedDescription, details: nil))
        }
    }
    
    /**
     * Stop current playback
     */
    private func stopPlayback() {
        audioPlayer?.stop()
        audioPlayer = nil
    }
    
    /**
     * Get available voices from ElevenLabs API
     */
    private func getAvailableVoices(result: @escaping FlutterResult) {
        guard let apiKey = apiKey else {
            result(FlutterError(code: "NOT_INITIALIZED", message: "ElevenLabs not initialized", details: nil))
            return
        }
        
        let url = URL(string: "\(baseUrl)/voices")!
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue(apiKey, forHTTPHeaderField: "xi-api-key")
        
        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                result(FlutterError(code: "NETWORK_ERROR", message: error.localizedDescription, details: nil))
                return
            }
            
            guard let httpResponse = response as? HTTPURLResponse,
                  httpResponse.statusCode == 200,
                  let data = data else {
                result(FlutterError(code: "API_ERROR", message: "Failed to fetch voices", details: nil))
                return
            }
            
            do {
                guard let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
                      let voicesArray = json["voices"] as? [[String: Any]] else {
                    result(FlutterError(code: "PARSE_ERROR", message: "Invalid response format", details: nil))
                    return
                }
                
                let voices = voicesArray.map { voice -> [String: Any] in
                    return [
                        "voice_id": voice["voice_id"] as? String ?? "",
                        "name": voice["name"] as? String ?? "",
                        "category": voice["category"] as? String ?? "unknown",
                        "description": voice["description"] as? String ?? ""
                    ]
                }
                
                result(voices)
                
            } catch {
                result(FlutterError(code: "PARSE_ERROR", message: error.localizedDescription, details: nil))
            }
        }
        
        task.resume()
    }
}
