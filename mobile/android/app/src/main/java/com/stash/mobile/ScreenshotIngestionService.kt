package com.stash.mobile

import android.content.Intent
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig

class ScreenshotIngestionService : HeadlessJsTaskService() {
    override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig? {
        val extras = intent?.extras
        val filePath = extras?.getString("filePath") ?: return null

        val data = Arguments.createMap().apply {
            putString("filePath", filePath)
        }

        return HeadlessJsTaskConfig(
            "ScreenshotIngestionTask",
            data,
            20000, // timeout in milliseconds (20 seconds)
            true  // allowed in foreground
        )
    }
}
