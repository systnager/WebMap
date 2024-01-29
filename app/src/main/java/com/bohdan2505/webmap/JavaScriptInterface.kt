package com.bohdan2505.webmap

import android.app.Instrumentation
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Build.VERSION.SDK_INT
import android.os.Environment
import android.webkit.JavascriptInterface
import android.widget.Toast
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.documentfile.provider.DocumentFile
import java.io.File
import java.io.IOException
import java.io.PrintWriter
import com.bohdan2505.webmap.R


class JavaScriptInterface(private val context: Context) {
    @JavascriptInterface
    fun copyToClipboard(value: String) {
        val clipboardManager = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager?
        val clipData = ClipData.newPlainText("label", value)
        clipboardManager!!.setPrimaryClip(clipData)
    }

    @JavascriptInterface
    fun downloadFile(fileContent: String?, fileName: String?) {
        val fileSystem = FileSystem()
        if (fileContent != null) {
            fileSystem.writeToFile(File("sdcard/Download/$fileName"), fileContent)
        }
    }
}

