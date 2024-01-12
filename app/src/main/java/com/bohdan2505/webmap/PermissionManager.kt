package com.bohdan2505.webmap

import android.Manifest
import android.app.Activity
import android.content.pm.PackageManager
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class PermissionManager(private val activity: Activity) {

    companion object {
        const val WRITE_EXTERNAL_STORAGE_REQUEST_CODE = 123
    }

    fun requestStoragePermission() {
        if (ContextCompat.checkSelfPermission(
                activity,
                Manifest.permission.WRITE_EXTERNAL_STORAGE
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            // Якщо дозволу немає, то запросити його
            ActivityCompat.requestPermissions(
                activity,
                arrayOf(Manifest.permission.WRITE_EXTERNAL_STORAGE),
                WRITE_EXTERNAL_STORAGE_REQUEST_CODE
            )
        } else {
            // Дозвіл вже наданий
            // Виконайте ваші дії, пов'язані з роботою з файлами
        }
    }

    fun handlePermissionResult(requestCode: Int, grantResults: IntArray): Boolean {
        when (requestCode) {
            WRITE_EXTERNAL_STORAGE_REQUEST_CODE -> {
                if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    return true
                    // Дозвіл наданий
                    // Виконайте ваші дії, пов'язані з роботою з файлами
                } else {
                    // Дозвіл не наданий
                    // Ви можете повідомити користувача про необхідність дозволу або взяти інші дії
                }
            }
            // Інші випадки можна обробити за потреби
        }
        return false
    }
}
