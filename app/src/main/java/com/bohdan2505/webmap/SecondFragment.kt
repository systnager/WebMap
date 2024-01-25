package com.bohdan2505.webmap

import android.Manifest
import android.annotation.SuppressLint
import android.content.ContentResolver
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.provider.MediaStore
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.webkit.*
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import com.bohdan2505.webmap.databinding.FragmentSecondBinding
import java.text.SimpleDateFormat
import java.util.*

/**
 * A simple [Fragment] subclass as the second destination in the navigation.
 */
class SecondFragment : Fragment() {

    private var _binding: FragmentSecondBinding? = null
    private val binding get() = _binding!!

    private var fileUploadCallback: ValueCallback<Array<Uri>>? = null
    private lateinit var currentPhotoUri: Uri
    private val FILE_CHOOSER_REQUEST_CODE = 132

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        (activity as? AppCompatActivity)?.supportActionBar?.hide()
        _binding = FragmentSecondBinding.inflate(inflater, container, false)

        val REQUEST_CODE_PERMISSION_ACCESS_FINE_LOCATION = 100

        activity?.let {
            ActivityCompat.requestPermissions(
                it, arrayOf<String>(Manifest.permission.ACCESS_FINE_LOCATION),
                REQUEST_CODE_PERMISSION_ACCESS_FINE_LOCATION
            )
        }

        initializeWebView()

        return binding.root
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun initializeWebView() {
        val pathToHtml = arguments?.getString("html_path").toString()
        val mapWebView: WebView = binding.root.findViewById(R.id.map_web_view)
        val webSettings: WebSettings = mapWebView.settings
        mapWebView.settings.javaScriptEnabled = true
        mapWebView.settings.setGeolocationEnabled(true)
        webSettings.allowFileAccess = true
        mapWebView.webChromeClient = WebChromeClient()
        mapWebView.settings.databaseEnabled = true
        mapWebView.settings.domStorageEnabled = true
        webSettings.setGeolocationEnabled(true)
        webSettings.setGeolocationDatabasePath(context?.filesDir?.path)
        webSettings.javaScriptEnabled = true
        val context: Context = binding.root.context
        webSettings.setGeolocationDatabasePath(context.filesDir.path)

        mapWebView.webChromeClient = MyClient()
        mapWebView.addJavascriptInterface(JavaScriptInterface(binding.root.context), "Android")

        mapWebView.webChromeClient = object : WebChromeClient() {
            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                fileUploadCallback?.onReceiveValue(null)
                fileUploadCallback = filePathCallback

                if (fileChooserParams?.acceptTypes?.contains("*/*") == true && fileChooserParams.isCaptureEnabled) {
                } else {
                    val intent = Intent(Intent.ACTION_GET_CONTENT)
                    intent.addCategory(Intent.CATEGORY_OPENABLE)
                    intent.type = "*/*"
                    val chooserIntent = Intent.createChooser(intent, "Choose File")
                    startActivityForResult(chooserIntent, FILE_CHOOSER_REQUEST_CODE)
                }

                return true
            }
        }

        mapWebView.loadUrl("file:///$pathToHtml")
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == FILE_CHOOSER_REQUEST_CODE) {
            if (fileUploadCallback == null) {
                super.onActivityResult(requestCode, resultCode, data)
                return
            }

            val results: Array<Uri>? = when {
                resultCode == AppCompatActivity.RESULT_OK && data?.data != null -> arrayOf(data.data!!)
                resultCode == AppCompatActivity.RESULT_OK -> arrayOf(currentPhotoUri)
                else -> null
            }

            fileUploadCallback?.onReceiveValue(results)
            fileUploadCallback = null
        } else {
            super.onActivityResult(requestCode, resultCode, data)
        }
    }

    override fun onDestroyView() {
        (activity as? AppCompatActivity)?.supportActionBar?.show()
        super.onDestroyView()
        _binding = null
    }

    override fun onResume() {
        (activity as? AppCompatActivity)?.supportActionBar?.hide()
        super.onResume()
    }
}

internal class MyClient : WebChromeClient() {
    override fun onGeolocationPermissionsShowPrompt(
        origin: String?,
        callback: GeolocationPermissions.Callback
    ) {
        callback.invoke(origin, true, false)
    }
}
