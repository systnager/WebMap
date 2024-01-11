package com.bohdan2505.webmap

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.bohdan2505.webmap.databinding.FragmentHomeBinding
import com.google.android.material.snackbar.Snackbar

class HomeFragment : Fragment() {

    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!

    private val PICK_FILE_REQUEST_CODE = 111
    private val ZIP_MIME_TYPE = "application/zip"
    private val ZIP_ARCHIVE_FOLDER_NAME = "maps"
    private val MAP_FOLDER = "map"

    private val archivesList = mutableListOf<String>()
    private lateinit var archiveAdapter: ArchiveAdapter

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

        // Налаштовуємо RecyclerView та його адаптер
        val recyclerView: RecyclerView = view.findViewById(R.id.archivesRecyclerView)
        archiveAdapter = ArchiveAdapter(archivesList)
        recyclerView.layoutManager = LinearLayoutManager(requireContext())
        recyclerView.adapter = archiveAdapter

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

    @SuppressLint("NotifyDataSetChanged")
    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode == PICK_FILE_REQUEST_CODE && resultCode == Activity.RESULT_OK) {
            data?.data?.let { uri ->
                val fileSystem :FileSystem = FileSystem()
                val filePath: String = fileSystem.getFilePathFromUri(uri, requireContext(), ZIP_ARCHIVE_FOLDER_NAME)

                // Перевіряємо, чи файл має розширення .zip
                if (filePath.endsWith(".zip", ignoreCase = true)) {
                    val appDirectory = fileSystem.createAppDirectory(requireContext(), ZIP_ARCHIVE_FOLDER_NAME)
                    fileSystem.copyFileToAppDirectory(filePath, appDirectory)

                    // Додаємо шлях архіву до списку та оновлюємо адаптер
                    archivesList.add(filePath)
                    archiveAdapter.notifyDataSetChanged()

                    Snackbar.make(binding.root, "File copied to ${appDirectory.absolutePath}", Snackbar.LENGTH_LONG).show()
                } else {
                    // Якщо файл не має розширення .zip, ви можете взяти відповідні дії
                    Snackbar.make(binding.root, "Please select a .zip file", Snackbar.LENGTH_SHORT).show()
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
