package com.bohdan2505.webmap

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.os.Build.VERSION.SDK_INT
import android.os.Environment
import android.webkit.JavascriptInterface
import android.widget.Toast
import androidx.core.app.ActivityCompat
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
        try {
            val f = fileName?.let { File("sdcard/Download", it) }
            if (f != null) {
                if (!f.exists()) {
                    f.createNewFile()
                    val printWriter = PrintWriter(f)
                    printWriter.print(fileContent)
                    printWriter.close()
                    Toast.makeText(
                        context,
                        context.resources.getString(R.string.downloaded_file_saved),
                        Toast.LENGTH_LONG
                    ).show()
                } else {
                    Toast.makeText(context, context.resources.getString(R.string.file_exist), Toast.LENGTH_LONG).show()
                }
            }
        } catch (e: IOException) {
            Toast.makeText(
                context,
                context.resources.getString(R.string.access_folder_error),
                Toast.LENGTH_LONG
            ).show()
            e.printStackTrace()
        }
    }
}

