package com.bohdan2505.webmap

import android.annotation.SuppressLint
import android.net.Uri
import android.provider.OpenableColumns
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.IOException
import android.content.Context

class FileSystem {
    @SuppressLint("Range")
    fun getFilePathFromUri(uri: Uri, requireContext: Context, ZIP_ARCHIVE_FOLDER_NAME: String): String {
        var filePath = ""
        if (uri.scheme == "content") {
            val cursor = requireContext.contentResolver.query(uri, null, null, null, null)
            cursor?.use {
                if (it.moveToFirst()) {
                    val displayName = it.getString(it.getColumnIndex(OpenableColumns.DISPLAY_NAME))
                    val appDirectory = this.createAppDirectory(requireContext, ZIP_ARCHIVE_FOLDER_NAME)

                    filePath = "${appDirectory.absolutePath}/$displayName"
                    val inputStream = requireContext.contentResolver.openInputStream(uri)
                    inputStream?.use { input ->
                        val outputStream = FileOutputStream(filePath)
                        outputStream.use { output ->
                            input.copyTo(output)
                        }
                    }
                }
            }
        } else if (uri.scheme == "file") {
            filePath = uri.path ?: ""
        }
        return filePath
    }

    fun createAppDirectory(requireContext: Context, ZIP_ARCHIVE_FOLDER_NAME: String): File {
        val appDirectory = File(requireContext.filesDir, ZIP_ARCHIVE_FOLDER_NAME)
        if (!appDirectory.exists()) {
            appDirectory.mkdir()
        }

        return appDirectory
    }

    fun copyFileToAppDirectory(sourceFilePath: String, destinationDirectory: File) {
        val sourceFile = File(sourceFilePath)
        val destinationFile = File(destinationDirectory, sourceFile.name)

        try {
            val sourceChannel = FileInputStream(sourceFile).channel
            val destinationChannel = FileOutputStream(destinationFile).channel
            sourceChannel.transferTo(0, sourceChannel.size(), destinationChannel)
            sourceChannel.close()
            destinationChannel.close()
        } catch (e: IOException) {
            e.printStackTrace()
            // Обробка помилок копіювання файлу
        }
    }
}