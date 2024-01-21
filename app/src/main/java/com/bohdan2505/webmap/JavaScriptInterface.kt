package com.bohdan2505.webmap

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.webkit.JavascriptInterface
import androidx.core.content.ContextCompat.getSystemService


class JavaScriptInterface(private val context: Context) {
    @JavascriptInterface
    fun copyToClipboard(value: String) {
        val clipboardManager = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager?
        val clipData = ClipData.newPlainText("label", value)
        clipboardManager!!.setPrimaryClip(clipData)
    }
}

