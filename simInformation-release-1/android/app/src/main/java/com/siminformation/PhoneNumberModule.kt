package com.siminformation;

import android.content.Context;
import android.telephony.TelephonyManager;
import android.os.Build;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

class PhoneNumberModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "PhoneNumberModule"
    }

    @ReactMethod
    fun getPhoneNumber(promise: com.facebook.react.bridge.Promise) {
        try {
            val telephonyManager = reactApplicationContext.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val phoneNumber = telephonyManager.line1Number
                promise.resolve(phoneNumber ?: "Unknown")
            } else {
                promise.reject("UNSUPPORTED", "API not supported")
            }
        } catch (e: SecurityException) {
            promise.reject("PERMISSION_DENIED", "Read phone state permission denied")
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }
}
