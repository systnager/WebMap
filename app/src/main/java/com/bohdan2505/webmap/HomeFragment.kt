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
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.bohdan2505.webmap.databinding.FragmentHomeBinding
import com.google.android.material.snackbar.Snackbar
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.IOException

class HomeFragment : Fragment() {

    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!

    private val PICK_FILE_REQUEST_CODE = 111
    private val ZIP_MIME_TYPE = "application/zip"
    private val ZIP_ARCHIVE_FOLDER_NAME = "maps"
    private val MAP_FOLDER = "map"

    // Список для зберігання шляхів архівів
    private val archivesList = mutableListOf<String>()

    // Адаптер для RecyclerView
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

    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode == PICK_FILE_REQUEST_CODE && resultCode == Activity.RESULT_OK) {
            data?.data?.let { uri ->
                val filePath: String = getFilePathFromUri(uri)

                // Перевіряємо, чи файл має розширення .zip
                if (filePath.endsWith(".zip", ignoreCase = true)) {
                    val appDirectory = createAppDirectory()
                    copyFileToAppDirectory(filePath, appDirectory)

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


    @SuppressLint("Range")
    private fun getFilePathFromUri(uri: Uri): String {
        var filePath = ""
        if (uri.scheme == "content") {
            val cursor = requireContext().contentResolver.query(uri, null, null, null, null)
            cursor?.use {
                if (it.moveToFirst()) {
                    val displayName = it.getString(it.getColumnIndex(OpenableColumns.DISPLAY_NAME))
                    val appDirectory = createAppDirectory()

                    filePath = "${appDirectory.absolutePath}/$displayName"
                    val inputStream = requireContext().contentResolver.openInputStream(uri)
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

    private fun createAppDirectory(): File {
        val appDirectory = File(requireContext().filesDir, ZIP_ARCHIVE_FOLDER_NAME)

        // Створюємо теку для вашого додатку, якщо вона не існує
        if (!appDirectory.exists()) {
            appDirectory.mkdir()
        }

        return appDirectory
    }

    private fun copyFileToAppDirectory(sourceFilePath: String, destinationDirectory: File) {
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

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    // Адаптер для RecyclerView
    inner class ArchiveAdapter(private val archiveList: List<String>) :
        RecyclerView.Adapter<ArchiveAdapter.ArchiveViewHolder>() {

        inner class ArchiveViewHolder(view: View) : RecyclerView.ViewHolder(view) {
            val archiveName: TextView = view.findViewById(R.id.archiveName)
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ArchiveViewHolder {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_archive, parent, false)
            return ArchiveViewHolder(view)
        }

        override fun onBindViewHolder(holder: ArchiveViewHolder, position: Int) {
            val archivePath = archiveList[position]
            val archiveFile = File(archivePath)

            holder.archiveName.text = archiveFile.name

            // Додаємо обробник кліка по списку
            holder.itemView.setOnClickListener {
                // Додайте ваш код для обробки кліка на елементі списку
                // Наприклад, можливо, ви хочете відкрити цей архів або виконати інші дії
            }
        }

        override fun getItemCount(): Int {
            return archiveList.size
        }
    }
}
