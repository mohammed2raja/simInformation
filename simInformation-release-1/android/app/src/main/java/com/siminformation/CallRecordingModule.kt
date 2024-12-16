package com.siminformation

import android.Manifest
import android.content.Context
import android.media.MediaRecorder
import android.telephony.PhoneStateListener
import android.telephony.TelephonyManager
import android.util.Log
import androidx.core.app.ActivityCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.File
import java.io.IOException
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap

class CallRecordingModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private var telephonyManager: TelephonyManager? = null
    private var mediaRecorder: MediaRecorder? = null
    private var isRecording: Boolean = false
    private var eventCount = 0
    private var filePath: String = ""

    override fun getName(): String {
        return "CallRecordingModule"
    }

    @ReactMethod
    fun startRecording(outputPath: String) {
        if (!hasRequiredPermissions()) {
            Log.e("CallRecordingModule", "Required permissions not granted.")
            throw SecurityException("Required permissions not granted.")
        }

        telephonyManager = reactApplicationContext.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
        Log.i("CallRecordingModule", "Starting recording. Listening for call state changes...")

        telephonyManager?.listen(object : PhoneStateListener() {
            override fun onCallStateChanged(state: Int, phoneNumber: String?) {
                Log.i("CallRecordingModule", "Call state changed: $state number: $phoneNumber")
                when (state) {
                    TelephonyManager.CALL_STATE_OFFHOOK -> {
                        if (!isRecording) {
                            val finalNumber = phoneNumber ?: "Unknown"
                            filePath = createOutputFilePath(outputPath, finalNumber)
                            startMediaRecorder(filePath)
                            val params: WritableMap = Arguments.createMap().apply {
                                putString("phoneNumber", phoneNumber)
                                putString("filePath", filePath)
                            }
                            sendEvent("onCallStarted", params)
                        }
                    }
                    TelephonyManager.CALL_STATE_IDLE -> {
                        if (isRecording) {
                            stopMediaRecorder()
                            val params: WritableMap = Arguments.createMap().apply {
                                putString("phoneNumber", phoneNumber)
                                putString("filePath", filePath)
                            }
                           sendEvent("onCallEnded", params)
                        }
                    }
                }
            }
        }, PhoneStateListener.LISTEN_CALL_STATE)
    }

    @ReactMethod
    fun stopRecording() {
        if (!isRecording) {
            Log.w("CallRecordingModule", "Stop recording called, but no recording is active.")
            return
        }
        Log.i("CallRecordingModule", "Stop recording called.")
        stopMediaRecorder()
        if (telephonyManager != null) {
            telephonyManager?.listen(null, PhoneStateListener.LISTEN_CALL_STATE)
            telephonyManager = null // Clean up reference
            Log.i("CallRecordingModule", "TelephonyManager listener stopped.")
        } else {
            Log.w("CallRecordingModule", "TelephonyManager is null; nothing to stop.")
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {
        eventCount++
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        eventCount -= count
        if (eventCount < 0) eventCount = 0
    }

    // Helper to send events to JavaScript
    private fun sendEvent(eventName: String, params: Any?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    private fun startMediaRecorder(filePath: String) {
        try {
            val file = File(filePath)
            file.parentFile?.mkdirs()

            mediaRecorder = MediaRecorder().apply {
                setAudioSource(MediaRecorder.AudioSource.VOICE_COMMUNICATION)
                setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
                setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
                setOutputFile(filePath)
                prepare()
                start()
                isRecording = true
            }
            Log.i("CallRecordingModule", "Recording started at: $filePath")
        } catch (e: Exception) {
            Log.e("CallRecordingModule", "Error starting media recorder: ${e.message}")
            e.printStackTrace()
        }
    }

    private fun stopMediaRecorder() {
        if (isRecording && mediaRecorder != null) {
            try {
                mediaRecorder?.apply {
                    stop()
                    release()
                }
                mediaRecorder = null
                isRecording = false
                Log.i("CallRecordingModule", "Recording stopped.")
            } catch (e: Exception) {
                Log.e("CallRecordingModule", "Error stopping recorder: ${e.message}")
                e.printStackTrace()
            }
        }
    }

    private fun createOutputFilePath(outputPath: String, phoneNumber: String): String {
        val timestamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
        val fileName = "call_recording_${phoneNumber}_$timestamp.m4a"
        val dir = File(outputPath)
        if (!dir.exists()) {
            dir.mkdirs()
        }
        return File(dir, fileName).absolutePath
    }

    private fun hasRequiredPermissions(): Boolean {
        val context: Context = reactApplicationContext
        val recordAudioGranted = ActivityCompat.checkSelfPermission(
            context,
            Manifest.permission.RECORD_AUDIO
        ) == android.content.pm.PackageManager.PERMISSION_GRANTED

        val readPhoneStateGranted = ActivityCompat.checkSelfPermission(
            context,
            Manifest.permission.READ_PHONE_STATE
        ) == android.content.pm.PackageManager.PERMISSION_GRANTED

        if (!recordAudioGranted) {
            Log.e("CallRecordingModule", "RECORD_AUDIO permission not granted.")
        }
        if (!readPhoneStateGranted) {
            Log.e("CallRecordingModule", "READ_PHONE_STATE permission not granted.")
        }

        return recordAudioGranted && readPhoneStateGranted
    }
}