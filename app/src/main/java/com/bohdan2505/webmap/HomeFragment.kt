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
import java.io.File

class HomeFragment : Fragment() {

    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!

    private val PICK_FILE_REQUEST_CODE = 111
    private val ZIP_MIME_TYPE = "application/zip"
    private val ZIP_ARCHIVE_FOLDER_NAME = "maps"
    private val MAP_FOLDER = "map"

    private val archivesList = mutableListOf<String>()
    private lateinit var archiveAdapter: ArchiveAdapter

    @SuppressLint("NotifyDataSetChanged")
    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentHomeBinding.inflate(inflater, container, false)

        val parentFolder = File(requireContext().filesDir, ZIP_ARCHIVE_FOLDER_NAME)
        val childDirectories = parentFolder.listFiles { file -> file.isDirectory }

        // Налаштовуємо RecyclerView та його адаптер
        val recyclerView: RecyclerView = binding.root.findViewById(R.id.archivesRecyclerView)
        archiveAdapter = ArchiveAdapter(archivesList, ::onDeleteFolder, ::onEditFolder, ::onFolderItemClick)
        recyclerView.layoutManager = LinearLayoutManager(requireContext())
        recyclerView.adapter = archiveAdapter

        if (archivesList.isEmpty()) {
            childDirectories?.forEach { directory ->
                archivesList.add(directory.name)
                println(directory.name)
            }
            archiveAdapter.notifyDataSetChanged()
            if (archivesList.isEmpty()) {
                binding.emptyStateTextView.text = "Список порожній"
            } else {
                binding.emptyStateTextView.text = ""
            }
        }

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
                Intent.createChooser(intent, "Виберіть файл .zip"),
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
                val fileSystem = FileSystem()
                val filePath: String = fileSystem.getFilePathFromUri(uri, requireContext(), ZIP_ARCHIVE_FOLDER_NAME)

                // Перевіряємо, чи файл має розширення .zip
                if (filePath.endsWith(".zip", ignoreCase = true)) {
                    val textInputDialog = TextInputDialog(binding.root.context)
                    textInputDialog.setOnTextEnteredListener(object : TextInputDialog.OnTextEnteredListener {
                        override fun onTextEntered(enteredText: String) {
                            if (!fileSystem.isValidFolderName(enteredText)) {
                                Snackbar.make(binding.root, "Невалідна назва. Видаліть спецсимволи, пробіли та обмежте довжину до 255 символів", Snackbar.LENGTH_LONG).show()
                                return
                            } else if (fileSystem.isFolderExists(File(requireContext().filesDir, "$ZIP_ARCHIVE_FOLDER_NAME/$enteredText"))) {
                                Snackbar.make(binding.root, "Така папка вже існує", Snackbar.LENGTH_LONG).show()
                                return
                            }

                            fileSystem.createAppDirectory(File(requireContext().filesDir, "$ZIP_ARCHIVE_FOLDER_NAME/$enteredText"))
                            Snackbar.make(binding.root, "Папку створено, очікуйте розпакування архіву", Snackbar.LENGTH_LONG).show()
                            fileSystem.unzip(File(filePath), File(requireContext().filesDir, "$ZIP_ARCHIVE_FOLDER_NAME/$enteredText"))
                            Snackbar.make(binding.root, "Архів розпаковано", Snackbar.LENGTH_LONG).show()
                            fileSystem.deleteFile(File(filePath))
                            fileSystem.clearFolder(File(requireContext().filesDir, MAP_FOLDER))
                            Snackbar.make(binding.root, "Починаю копіювання карти", Snackbar.LENGTH_LONG).show()
                            fileSystem.copyFiles(File(requireContext().filesDir, "$ZIP_ARCHIVE_FOLDER_NAME/$enteredText"), File(requireContext().filesDir, MAP_FOLDER))
                            Snackbar.make(binding.root, "Копіювання закінчено", Snackbar.LENGTH_LONG).show()
                            binding.emptyStateTextView.text = ""
                            archivesList.add(enteredText)
                            archiveAdapter.notifyDataSetChanged()
                            Snackbar.make(binding.root, "Операції закінчено!", Snackbar.LENGTH_LONG).show()
                        }
                    })
                    textInputDialog.showDialog("Введіть назву для карти без пробілів та спецсимволів", "Підтвердити ввід", "Відмінити")
                } else {
                    // Якщо файл не має розширення .zip, ви можете взяти відповідні дії
                    archiveAdapter.notifyDataSetChanged()
                    Snackbar.make(binding.root, "Будь ласка, виберіть файл .zip", Snackbar.LENGTH_SHORT).show()

                }
            }
        }
    }

    @SuppressLint("NotifyDataSetChanged")
    private fun onDeleteFolder(folderName: String) {
        val fileSystem = FileSystem()
        if (fileSystem.deleteFolder(File(requireContext().filesDir, "$ZIP_ARCHIVE_FOLDER_NAME/$folderName"))) {
            archivesList.remove(folderName)
            archiveAdapter.notifyDataSetChanged()
            if (archivesList.isEmpty()) {
                binding.emptyStateTextView.text = "Список порожній"
            }
            Snackbar.make(binding.root, "Папку видалено", Snackbar.LENGTH_SHORT).show()
        } else {
            Snackbar.make(binding.root, "Не вдалося видалити папку", Snackbar.LENGTH_SHORT).show()
        }

    }

    private fun onEditFolder(folderName: String) {
        Snackbar.make(binding.root, "Редагування папки", Snackbar.LENGTH_SHORT).show()
    }

    private fun onFolderItemClick(folderName: String) {
        Snackbar.make(binding.root, "Відкриття карти", Snackbar.LENGTH_SHORT).show()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
