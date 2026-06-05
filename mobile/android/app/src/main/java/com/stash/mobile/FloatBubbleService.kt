package com.stash.mobile

import android.app.Activity
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.graphics.Bitmap
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.hardware.display.DisplayManager
import android.hardware.display.VirtualDisplay
import android.media.ImageReader
import android.media.projection.MediaProjection
import android.media.projection.MediaProjectionManager
import android.os.Build
import android.os.Handler
import android.os.HandlerThread
import android.os.IBinder
import android.os.Looper
import android.util.DisplayMetrics
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.TextView
import android.widget.Toast
import java.io.File
import java.io.FileOutputStream

class FloatBubbleService : Service() {

    companion object {
        var isRunning = false
        private const val CHANNEL_ID = "FloatBubbleServiceChannel"
        private const val NOTIFICATION_ID = 8991
    }

    private lateinit var windowManager: WindowManager
    private var bubbleView: FrameLayout? = null
    private lateinit var params: WindowManager.LayoutParams

    private var mediaProjectionManager: MediaProjectionManager? = null
    private var mediaProjection: MediaProjection? = null

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent != null) {
            val resultCode = intent.getIntExtra("resultCode", Activity.RESULT_CANCELED)
            val data = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                intent.getParcelableExtra("data", Intent::class.java)
            } else {
                @Suppress("DEPRECATION")
                intent.getParcelableExtra("data")
            }

            if (resultCode == Activity.RESULT_OK && data != null) {
                mediaProjectionManager = getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
                mediaProjection = mediaProjectionManager?.getMediaProjection(resultCode, data)
            }
        }

        // Start Foreground Service
        val notification = createNotification()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(
                NOTIFICATION_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PROJECTION
            )
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }

        showFloatingBubble()
        isRunning = true

        return START_NOT_STICKY
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Stash Overlay Ingestion",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Active capture bubble status notification"
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun createNotification(): Notification {
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, CHANNEL_ID)
        } else {
            @Suppress("DEPRECATION")
            Notification.Builder(this)
        }

        return builder
            .setContentTitle("Stash Ingestion Active")
            .setContentText("Tap overlay to capture & stash elements")
            .setSmallIcon(android.R.drawable.ic_input_add)
            .setContentIntent(pendingIntent)
            .build()
    }

    private fun showFloatingBubble() {
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager

        val sizePx = (56 * resources.displayMetrics.density).toInt()

        params = WindowManager.LayoutParams(
            sizePx,
            sizePx,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            } else {
                @Suppress("DEPRECATION")
                WindowManager.LayoutParams.TYPE_PHONE
            },
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = 100
            y = 500
        }

        bubbleView = FrameLayout(this).apply {
            val shape = GradientDrawable().apply {
                shape = GradientDrawable.OVAL
                setColor(Color.parseColor("#E50B0F19")) // Sleek glassmorphic deep dark background
                setStroke((2 * resources.displayMetrics.density).toInt(), Color.parseColor("#22D3EE")) // Cyan border glow
            }
            background = shape

            val textView = TextView(context).apply {
                text = "S"
                setTextColor(Color.parseColor("#22D3EE"))
                textSize = 18f
                typeface = Typeface.create("sans-serif-condensed", Typeface.BOLD)
                gravity = Gravity.CENTER
            }
            addView(textView, FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            ))
        }

        bubbleView?.setOnTouchListener(object : View.OnTouchListener {
            private var initialX = 0
            private var initialY = 0
            private var initialTouchX = 0f
            private var initialTouchY = 0f
            private var isMoving = false

            override fun onTouch(v: View, event: MotionEvent): Boolean {
                when (event.action) {
                    MotionEvent.ACTION_DOWN -> {
                        initialX = params.x
                        initialY = params.y
                        initialTouchX = event.rawX
                        initialTouchY = event.rawY
                        isMoving = false
                        return true
                    }
                    MotionEvent.ACTION_MOVE -> {
                        val diffX = event.rawX - initialTouchX
                        val diffY = event.rawY - initialTouchY
                        if (Math.abs(diffX) > 15 || Math.abs(diffY) > 15) {
                            isMoving = true
                        }
                        params.x = initialX + diffX.toInt()
                        params.y = initialY + diffY.toInt()
                        windowManager.updateViewLayout(bubbleView, params)
                        return true
                    }
                    MotionEvent.ACTION_UP -> {
                        if (!isMoving) {
                            onBubbleClicked()
                        }
                        return true
                    }
                }
                return false
            }
        })

        windowManager.addView(bubbleView, params)
    }

    private fun onBubbleClicked() {
        bubbleView?.visibility = View.GONE

        // Delay to allow the bubble view to completely disappear before capturing
        Handler(Looper.getMainLooper()).postDelayed({
            captureScreen()
        }, 150)
    }

    private fun captureScreen() {
        val proj = mediaProjection
        if (proj == null) {
            Toast.makeText(this, "Capture token not active", Toast.LENGTH_SHORT).show()
            bubbleView?.visibility = View.VISIBLE
            return
        }

        val displayMetrics = resources.displayMetrics
        val width = displayMetrics.widthPixels
        val height = displayMetrics.heightPixels
        val density = displayMetrics.densityDpi

        val imageReader = ImageReader.newInstance(width, height, PixelFormat.RGBA_8888, 2)
        val handlerThread = HandlerThread("StashCaptureThread").apply { start() }
        val handler = Handler(handlerThread.looper)

        var virtualDisplay: VirtualDisplay? = null

        imageReader.setOnImageAvailableListener({ reader ->
            try {
                val image = reader.acquireLatestImage()
                if (image != null) {
                    reader.setOnImageAvailableListener(null, null)

                    val planes = image.planes
                    val buffer = planes[0].buffer
                    val pixelStride = planes[0].pixelStride
                    val rowStride = planes[0].rowStride
                    val rowPadding = rowStride - pixelStride * width

                    val bitmap = Bitmap.createBitmap(width + rowPadding / pixelStride, height, Bitmap.Config.ARGB_8888)
                    bitmap.copyPixelsFromBuffer(buffer)
                    image.close()

                    virtualDisplay?.release()
                    handlerThread.quit()

                    val cleanBitmap = if (rowPadding > 0) {
                        Bitmap.createBitmap(bitmap, 0, 0, width, height)
                    } else {
                        bitmap
                    }

                    val file = File(cacheDir, "stash_screenshot_${System.currentTimeMillis()}.png")
                    FileOutputStream(file).use { out ->
                        cleanBitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
                    }

                    Handler(Looper.getMainLooper()).post {
                        Toast.makeText(this@FloatBubbleService, "Captured! Stashing...", Toast.LENGTH_SHORT).show()
                        bubbleView?.visibility = View.VISIBLE
                    }

                    startHeadlessTask(file.absolutePath)
                }
            } catch (e: Exception) {
                e.printStackTrace()
                Handler(Looper.getMainLooper()).post {
                    Toast.makeText(this@FloatBubbleService, "Capture failed: ${e.message}", Toast.LENGTH_SHORT).show()
                    bubbleView?.visibility = View.VISIBLE
                }
                try {
                    virtualDisplay?.release()
                    handlerThread.quit()
                } catch (ex: Exception) {}
            }
        }, handler)

        try {
            virtualDisplay = proj.createVirtualDisplay(
                "StashCaptureDisplay",
                width,
                height,
                density,
                DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR,
                imageReader.surface,
                null,
                handler
            )
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(this, "Failed to initialize virtual display", Toast.LENGTH_SHORT).show()
            bubbleView?.visibility = View.VISIBLE
            handlerThread.quit()
        }
    }

    private fun startHeadlessTask(filePath: String) {
        val serviceIntent = Intent(this, ScreenshotIngestionService::class.java).apply {
            putExtra("filePath", filePath)
        }
        startService(serviceIntent)
    }

    override fun onDestroy() {
        super.onDestroy()
        isRunning = false
        mediaProjection?.stop()
        mediaProjection = null

        bubbleView?.let {
            try {
                windowManager.removeView(it)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}
