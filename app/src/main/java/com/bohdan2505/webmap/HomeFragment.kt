package com.bohdan2505.webmap

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.OpenableColumns
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.bohdan2505.webmap.databinding.FragmentHomeBinding
import com.google.android.material.snackbar.Snackbar

class HomeFragment : Fragment() {

    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!

    private val PICK_FILE_REQUEST_CODE = 111
    private val ZIP_MIME_TYPE = "application/zip"

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentHomeBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.buttonFirst.setOnClickListener {
            findNavController().navigate(R.id.action_FirstFragment_to_SecondFragment)
        }

        binding.chooseFileButton.setOnClickListener {
            val intent = Intent()
                .setType("*/*")
                .setAction(Intent.ACTION_GET_CONTENT)
                .putExtra(Intent.EXTRA_MIME_TYPES, arrayOf(ZIP_MIME_TYPE))

            startActivityForResult(
                Intent.createChooser(intent, "Select a .zip file"),
                PICK_FILE_REQUEST_CODE
            )
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode == PICK_FILE_REQUEST_CODE && resultCode == Activity.RESULT_OK) {
            data?.data?.let { uri ->
                val filePath: String = getFilePathFromUri(uri)

                // Перевіряємо, чи файл має розширення .zip
                if (filePath.endsWith(".zip", ignoreCase = true)) {
                    Snackbar.make(binding.root, filePath, Snackbar.LENGTH_LONG).show()
                } else {
                    // Якщо файл не має розширення .zip, ви можете взяти відповідні дії
                    Snackbar.make(binding.root, "Please select a .zip file", Snackbar.LENGTH_SHORT).show()
                }
            }
        }
    }

    @SuppressLint("Range")
    private fun getFilePathFromUri(uri: Uri): String {
        var filePath = ""
        if (uri.scheme == "content") {
            val cursor = requireContext().contentResolver.query(uri, null, null, null, null)
            cursor?.use {
                if (it.moveToFirst()) {
                    val displayName = it.getString(it.getColumnIndex(OpenableColumns.DISPLAY_NAME))
                    filePath = "${requireContext().cacheDir}/$displayName"
                    val inputStream = requireContext().contentResolver.openInputStream(uri)
                    inputStream?.use { input ->
                        val outputStream = requireContext().openFileOutput(displayName, 0)
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

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
