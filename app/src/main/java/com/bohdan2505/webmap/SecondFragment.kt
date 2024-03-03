package com.bohdan2505.webmap

import android.Manifest
import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.webkit.GeolocationPermissions
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.fragment.app.Fragment
import com.bohdan2505.webmap.databinding.FragmentSecondBinding

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

    @SuppressLint("SetJavaScriptEnabled", "UnsafeWebViewClientUsage")
    private fun initializeWebView() {
        val pathToHtml = arguments?.getString("html_path").toString()
        val mapWebView: WebView = binding.root.findViewById(R.id.map_web_view)
        val webSettings: WebSettings = mapWebView.settings
        mapWebView.settings.javaScriptEnabled = true
        mapWebView.settings.setGeolocationEnabled(true)
        webSettings.allowFileAccess = true
        mapWebView.settings.databaseEnabled = true
        mapWebView.settings.domStorageEnabled = true
        webSettings.setGeolocationEnabled(true)
        webSettings.setGeolocationDatabasePath(context?.filesDir?.path)
        mapWebView.webChromeClient = MyClient()
        mapWebView.webViewClient = WebViewClient()
        mapWebView.loadUrl("file:///$pathToHtml")
        // mapWebView.loadUrl("file:///android_asset/index.html")
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
