package com.bohdan2505.webmap

import android.annotation.SuppressLint
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.navigation.fragment.findNavController
import com.bohdan2505.webmap.databinding.FragmentSecondBinding

/**
 * A simple [Fragment] subclass as the second destination in the navigation.
 */
class SecondFragment : Fragment() {

    private var _binding: FragmentSecondBinding? = null
    private val MAP_FOLDER = "map"

    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreateView(
            inflater: LayoutInflater, container: ViewGroup?,
            savedInstanceState: Bundle?
    ): View {

        _binding = FragmentSecondBinding.inflate(inflater, container, false)

        val mapWebView: WebView = binding.root.findViewById(R.id.map_web_view)
        val webSettings: WebSettings = mapWebView.settings
        mapWebView.settings.javaScriptEnabled = true
        mapWebView.webChromeClient = WebChromeClient()
        mapWebView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                // Запобігає відкриттю сторінок у сторонніх браузерах
                view?.loadUrl(request?.url.toString())
                return true
            }
        }

        // Вказати шлях до index.html у внутрішній директорії додатка
        val indexPath = "file://${requireContext().filesDir.absolutePath}/$MAP_FOLDER/index.html"
        mapWebView.loadUrl(indexPath)


        return binding.root

    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}