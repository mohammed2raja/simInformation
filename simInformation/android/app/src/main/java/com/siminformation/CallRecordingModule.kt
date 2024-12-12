package com.siminformation

import android.content.Context
import android.media.MediaRecorder
import android.telephony.PhoneStateListener
import android.telephony.TelephonyManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class CallRecordingModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private var telephonyManager: TelephonyManager? = null
    private var mediaRecorder: MediaRecorder? = null
    private var isRecording: Boolean = false
    private var eventCount = 0


    override fun getName(): String {
        return "CallRecordingModule"
    }

    @ReactMethod
    fun startRecording(outputPath: String) {
        telephonyManager = reactApplicationContext.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager

        telephonyManager?.listen(object : PhoneStateListener() {
            override fun onCallStateChanged(state: Int, phoneNumber: String?) {
                when (state) {
                    TelephonyManager.CALL_STATE_OFFHOOK -> {
                        if (!isRecording) {
                            startMediaRecorder(outputPath)
                            emitEvent("onCallStarted", phoneNumber ?: "Unknown")
                        }
                    }
                    TelephonyManager.CALL_STATE_IDLE -> {
                        if (isRecording) {
                            stopMediaRecorder()
                            emitEvent("onCallEnded", phoneNumber ?: "Unknown")
                        }
                    }
                }
            }
        }, PhoneStateListener.LISTEN_CALL_STATE)
    }

    @ReactMethod
    fun stopRecording() {
        stopMediaRecorder()
        telephonyManager?.listen(null, PhoneStateListener.LISTEN_NONE) // Stop listening
    }

     // Add the required methods
    @ReactMethod
    fun addListener(eventName: String) {
        // Increment the event count
        eventCount++
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Decrement the event count
        eventCount -= count
        if (eventCount < 0) eventCount = 0
    }

    // Helper to send events to JavaScript
    private fun sendEvent(eventName: String, params: Any?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }
    
    private fun startMediaRecorder(outputPath: String) {
        try {
            mediaRecorder = MediaRecorder()
            mediaRecorder?.apply {
                setAudioSource(MediaRecorder.AudioSource.VOICE_COMMUNICATION)
                setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
                setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
                setOutputFile("$outputPath/call_recording_${System.currentTimeMillis()}.mp4")
                prepare()
                start()
                isRecording = true
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun stopMediaRecorder() {
        try {
            mediaRecorder?.apply {
                stop()
                release()
            }
            mediaRecorder = null
            isRecording = false
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun emitEvent(eventName: String, phoneNumber: String) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, phoneNumber)
    }
}
