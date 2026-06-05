package com.stash.mobile

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.media.projection.MediaProjectionManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class FloatBubbleModule(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    private var permissionPromise: Promise? = null
    private val REQUEST_CODE_MEDIA_PROJECTION = 9081

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String {
        return "FloatBubbleModule"
    }

    @ReactMethod
    fun hasOverlayPermission(promise: Promise) {
        val context = reactApplicationContext
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            promise.resolve(Settings.canDrawOverlays(context))
        } else {
            promise.resolve(true)
        }
    }

    @ReactMethod
    fun requestOverlayPermission(promise: Promise) {
        val context = reactApplicationContext
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (!Settings.canDrawOverlays(context)) {
                val intent = Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:${context.packageName}")
                ).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                context.startActivity(intent)
                promise.resolve(false)
            } else {
                promise.resolve(true)
            }
        } else {
            promise.resolve(true)
        }
    }

    @ReactMethod
    fun startBubbleService(promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject("ACTIVITY_NULL", "Activity is null")
            return
        }

        val context = reactApplicationContext
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(context)) {
            promise.reject("PERMISSION_DENIED", "Overlay permission not granted")
            return
        }

        if (FloatBubbleService.isRunning) {
            promise.resolve(true)
            return
        }

        permissionPromise = promise
        val mediaProjectionManager = activity.getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
        val intent = mediaProjectionManager.createScreenCaptureIntent()
        activity.startActivityForResult(intent, REQUEST_CODE_MEDIA_PROJECTION)
    }

    @ReactMethod
    fun stopBubbleService(promise: Promise) {
        val context = reactApplicationContext
        val intent = Intent(context, FloatBubbleService::class.java)
        context.stopService(intent)
        promise.resolve(true)
    }

    @ReactMethod
    fun isBubbleServiceRunning(promise: Promise) {
        promise.resolve(FloatBubbleService.isRunning)
    }

    override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == REQUEST_CODE_MEDIA_PROJECTION) {
            val promise = permissionPromise
            permissionPromise = null
            if (resultCode == Activity.RESULT_OK && data != null) {
                val context = reactApplicationContext
                val intent = Intent(context, FloatBubbleService::class.java).apply {
                    putExtra("resultCode", resultCode)
                    putExtra("data", data)
                }
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(intent)
                } else {
                    context.startService(intent)
                }
                promise?.resolve(true)
            } else {
                promise?.resolve(false)
            }
        }
    }

    override fun onNewIntent(intent: Intent?) {
        // No-op
    }
}
