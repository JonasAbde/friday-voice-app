package com.friday.voice

import android.content.Context
import android.media.MediaPlayer
import io.flutter.embedding.engine.plugins.FlutterPlugin
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel
import io.flutter.plugin.common.MethodChannel.MethodCallHandler
import io.flutter.plugin.common.MethodChannel.Result
import kotlinx.coroutines.*
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.File
import java.io.IOException

/**
 * ElevenLabsPlugin - Android implementation for ElevenLabs TTS
 * 
 * Handles API calls to ElevenLabs and audio playback
 * Provides high-quality neural TTS with voice cloning support
 */
class ElevenLabsPlugin : FlutterPlugin, MethodCallHandler {
    private lateinit var channel: MethodChannel
    private lateinit var context: Context
    private var apiKey: String? = null
    private var defaultVoiceId: String? = null
    private var mediaPlayer: MediaPlayer? = null
    private val client = OkHttpClient()
    private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())

    companion object {
        private const val CHANNEL = "com.friday/elevenlabs"
        private const val BASE_URL = "https://api.elevenlabs.io/v1"
    }

    override fun onAttachedToEngine(flutterPluginBinding: FlutterPlugin.FlutterPluginBinding) {
        context = flutterPluginBinding.applicationContext
        channel = MethodChannel(flutterPluginBinding.binaryMessenger, CHANNEL)
        channel.setMethodCallHandler(this)
    }

    override fun onMethodCall(call: MethodCall, result: Result) {
        when (call.method) {
            "initialize" -> {
                apiKey = call.argument<String>("apiKey")
                defaultVoiceId = call.argument<String>("voiceId")
                
                if (apiKey.isNullOrEmpty()) {
                    result.error("INVALID_API_KEY", "API key is required", null)
                } else {
                    result.success(true)
                }
            }
            
            "speak" -> {
                val text = call.argument<String>("text")
                val voiceId = call.argument<String>("voiceId") ?: defaultVoiceId
                
                if (text.isNullOrEmpty()) {
                    result.error("INVALID_TEXT", "Text is required", null)
                    return
                }
                
                if (voiceId.isNullOrEmpty()) {
                    result.error("INVALID_VOICE", "Voice ID is required", null)
                    return
                }
                
                scope.launch {
                    try {
                        synthesizeAndPlay(text, voiceId, result)
                    } catch (e: Exception) {
                        result.error("SYNTHESIS_ERROR", e.message, null)
                    }
                }
            }
            
            "stop" -> {
                stopPlayback()
                result.success(true)
            }
            
            "getVoices" -> {
                scope.launch {
                    try {
                        val voices = getAvailableVoices()
                        result.success(voices)
                    } catch (e: Exception) {
                        result.error("VOICES_ERROR", e.message, null)
                    }
                }
            }
            
            else -> {
                result.notImplemented()
            }
        }
    }

    /**
     * Synthesize speech using ElevenLabs API and play it
     */
    private suspend fun synthesizeAndPlay(text: String, voiceId: String, result: Result) = withContext(Dispatchers.IO) {
        if (apiKey.isNullOrEmpty()) {
            withContext(Dispatchers.Main) {
                result.error("NOT_INITIALIZED", "ElevenLabs not initialized", null)
            }
            return@withContext
        }

        // Build request
        val jsonBody = JSONObject().apply {
            put("text", text)
            put("model_id", "eleven_multilingual_v2")
            put("voice_settings", JSONObject().apply {
                put("stability", 0.5)
                put("similarity_boost", 0.75)
            })
        }

        val requestBody = jsonBody.toString()
            .toRequestBody("application/json".toMediaType())

        val request = Request.Builder()
            .url("$BASE_URL/text-to-speech/$voiceId")
            .addHeader("xi-api-key", apiKey!!)
            .post(requestBody)
            .build()

        try {
            val response = client.newCall(request).execute()
            
            if (!response.isSuccessful) {
                val errorBody = response.body?.string() ?: "Unknown error"
                throw IOException("API error: ${response.code} - $errorBody")
            }

            // Save audio to temp file
            val audioBytes = response.body?.bytes()
                ?: throw IOException("Empty response body")
                
            val tempFile = File.createTempFile("elevenlabs_", ".mp3", context.cacheDir)
            tempFile.writeBytes(audioBytes)

            // Play audio
            withContext(Dispatchers.Main) {
                playAudio(tempFile.absolutePath, result)
            }
            
        } catch (e: IOException) {
            withContext(Dispatchers.Main) {
                result.error("NETWORK_ERROR", e.message, null)
            }
        }
    }

    /**
     * Play audio file using MediaPlayer
     */
    private fun playAudio(path: String, result: Result) {
        try {
            // Release previous player if exists
            mediaPlayer?.release()
            
            mediaPlayer = MediaPlayer().apply {
                setDataSource(path)
                setOnCompletionListener {
                    // Clean up temp file
                    File(path).delete()
                }
                setOnErrorListener { _, what, extra ->
                    result.error("PLAYBACK_ERROR", "Error: $what, $extra", null)
                    true
                }
                prepare()
                start()
            }
            
            result.success(true)
            
        } catch (e: Exception) {
            result.error("PLAYBACK_ERROR", e.message, null)
        }
    }

    /**
     * Stop current playback
     */
    private fun stopPlayback() {
        mediaPlayer?.apply {
            if (isPlaying) {
                stop()
            }
            release()
        }
        mediaPlayer = null
    }

    /**
     * Get available voices from ElevenLabs API
     */
    private suspend fun getAvailableVoices(): List<Map<String, Any>> = withContext(Dispatchers.IO) {
        if (apiKey.isNullOrEmpty()) {
            throw IllegalStateException("ElevenLabs not initialized")
        }

        val request = Request.Builder()
            .url("$BASE_URL/voices")
            .addHeader("xi-api-key", apiKey!!)
            .get()
            .build()

        val response = client.newCall(request).execute()
        
        if (!response.isSuccessful) {
            throw IOException("API error: ${response.code}")
        }

        val responseBody = response.body?.string() ?: "{}"
        val json = JSONObject(responseBody)
        val voicesArray = json.getJSONArray("voices")
        
        val voices = mutableListOf<Map<String, Any>>()
        for (i in 0 until voicesArray.length()) {
            val voice = voicesArray.getJSONObject(i)
            voices.add(mapOf(
                "voice_id" to voice.getString("voice_id"),
                "name" to voice.getString("name"),
                "category" to voice.optString("category", "unknown"),
                "description" to voice.optString("description", "")
            ))
        }
        
        voices
    }

    override fun onDetachedFromEngine(binding: FlutterPlugin.FlutterPluginBinding) {
        channel.setMethodCallHandler(null)
        stopPlayback()
        scope.cancel()
    }
}
