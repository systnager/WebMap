package com.bohdan2505.webmap

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.provider.Settings
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.annotation.RequiresApi
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.bohdan2505.webmap.databinding.FragmentHomeBinding
import com.google.android.material.snackbar.Snackbar
import kotlinx.coroutines.launch
import java.io.File

class HomeFragment : Fragment() {

    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!

    private val appFolderName = "WebMap"
    private val mapsListFolderName = "maps"
    private val rootPath = Environment.getExternalStorageDirectory().absolutePath
    private val appFolderPath = File(rootPath, appFolderName).absolutePath
    private val mapFolderPath = File(appFolderPath, mapsListFolderName).absolutePath
    private val pickFileRequestCode = 111
    private val zipMimeType = "application/zip"

    private val archivesList = mutableListOf<String>()
    private lateinit var archiveAdapter: ArchiveAdapter

    @SuppressLint("NotifyDataSetChanged")
    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentHomeBinding.inflate(inflater, container, false)

        val parentFolder = File(mapFolderPath)
        val childDirectories = parentFolder.listFiles { file -> file.isDirectory }

        val recyclerView: RecyclerView = binding.root.findViewById(R.id.archivesRecyclerView)
        archiveAdapter = ArchiveAdapter(archivesList, ::onDeleteFolder, ::onEditFolder, ::onFolderItemClick)
        recyclerView.layoutManager = LinearLayoutManager(requireContext())
        recyclerView.adapter = archiveAdapter

        if (archivesList.isEmpty()) {
            childDirectories?.forEach { directory ->
                archivesList.add(directory.name)
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

    @RequiresApi(Build.VERSION_CODES.R)
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        viewLifecycleOwner.lifecycleScope.launch {
            checkAndRequestStoragePermission()
        }

        binding.buttonFirst.setOnClickListener {
            Snackbar.make(binding.root, "Запуск останньо відкритої карти. У розробці", Snackbar.LENGTH_LONG).show()
        }

        binding.chooseFileButton.setOnClickListener {
            val intent = Intent()
                .setType("*/*")
                .setAction(Intent.ACTION_GET_CONTENT)
                .putExtra(Intent.EXTRA_MIME_TYPES, arrayOf(zipMimeType))

            startActivityForResult(
                Intent.createChooser(intent, "Виберіть файл .zip"),
                pickFileRequestCode
            )
        }
    }

    @RequiresApi(Build.VERSION_CODES.R)
    private val launcher: ActivityResultLauncher<Intent> =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            if (Environment.isExternalStorageManager()) {
                Snackbar.make(binding.root, "Дозвіл надано", Snackbar.LENGTH_LONG).show()
            } else {
                Snackbar.make(binding.root, "Потрібно надати дозвіл. Роботу додатку не гарантовано", Snackbar.LENGTH_LONG).show()
            }
        }

    @RequiresApi(Build.VERSION_CODES.R)
    private fun checkAndRequestStoragePermission() {
        if (!Environment.isExternalStorageManager()) {
            val intent = Intent(Settings.ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION)
            launcher.launch(intent)
        } else {
            // Користувач вже надав дозвіл
            // Ваш код для роботи з файловою системою
        }
    }

    @SuppressLint("NotifyDataSetChanged")
    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode == pickFileRequestCode && resultCode == Activity.RESULT_OK) {
            data?.data?.let { uri ->
                val fileSystem = FileSystem()
                val filePath: String = fileSystem.getFilePathFromUri(uri, requireContext(), mapsListFolderName)

                if (filePath.endsWith(".zip", ignoreCase = true)) {
                    val textInputDialog = TextInputDialog(binding.root.context)
                    textInputDialog.setOnTextEnteredListener(object : TextInputDialog.OnTextEnteredListener {
                        override fun onTextEntered(enteredText: String) {
                            if (!fileSystem.isValidFolderName(enteredText)) {
                                Snackbar.make(binding.root, "Невалідна назва. Видаліть спецсимволи, пробіли та обмежте довжину до 255 символів", Snackbar.LENGTH_LONG).show()
                                return
                            } else if (fileSystem.isFolderExists(File(mapFolderPath, enteredText))) {
                                Snackbar.make(binding.root, "Така папка вже існує", Snackbar.LENGTH_LONG).show()
                                return
                            }

                            fileSystem.createAppDirectory(File(mapFolderPath, enteredText))
                            Snackbar.make(binding.root, "Папку створено, очікуйте розпакування архіву", Snackbar.LENGTH_LONG).show()
                            fileSystem.unzip(File(filePath), File(mapFolderPath, enteredText))
                            fileSystem.deleteFile(File(filePath))
                            binding.emptyStateTextView.text = ""
                            archivesList.add(enteredText)
                            archiveAdapter.notifyDataSetChanged()
                            Snackbar.make(binding.root, "Архів розпаковано", Snackbar.LENGTH_LONG).show()
                        }
                    })
                    textInputDialog.showDialog("Введіть назву для карти без пробілів та спецсимволів", "Підтвердити ввід", "Відмінити")
                } else {
                    archiveAdapter.notifyDataSetChanged()
                    Snackbar.make(binding.root, "Будь ласка, виберіть файл .zip", Snackbar.LENGTH_SHORT).show()
                }
            }
        }
    }

    @SuppressLint("NotifyDataSetChanged")
    private fun onDeleteFolder(folderName: String) {
        val fileSystem = FileSystem()
        if (fileSystem.deleteFolder(File(mapFolderPath, folderName))) {
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
        val textInputDialog = TextInputDialog(binding.root.context)
        val fileSystem = FileSystem()
        textInputDialog.setOnTextEnteredListener(object : TextInputDialog.OnTextEnteredListener {
            @SuppressLint("NotifyDataSetChanged")
            override fun onTextEntered(enteredText: String) {
                if (!fileSystem.isValidFolderName(enteredText)) {
                    Snackbar.make(binding.root, "Невалідна назва. Видаліть спецсимволи, пробіли та обмежте довжину до 255 символів", Snackbar.LENGTH_LONG).show()
                    return
                } else if (fileSystem.isFolderExists(File(mapFolderPath, enteredText))) {
                    Snackbar.make(binding.root, "Така папка вже існує", Snackbar.LENGTH_LONG).show()
                    return
                }

                if (fileSystem.renameFolder(File(mapFolderPath, folderName), File(mapFolderPath, enteredText))) {
                    val index = archivesList.indexOf(folderName)
                    archivesList[index] = enteredText
                    archiveAdapter.notifyDataSetChanged()
                    Snackbar.make(binding.root, "Папку перейменовано", Snackbar.LENGTH_LONG).show()
                } else {
                    Snackbar.make(binding.root, "Не вдалося перейменувати папку", Snackbar.LENGTH_LONG).show()
                }
            }
        })
        textInputDialog.showDialog("Введіть нову назву для карти без пробілів та спецсимволів", "Підтвердити ввід", "Відмінити")
    }

    private fun onFolderItemClick(folderName: String) {
        FileSystem()
        val dataToPass = File("$mapFolderPath/$folderName/", "index.html").absolutePath
        val bundle = Bundle()
        bundle.putString("html_path", dataToPass)

        val destinationFragment = SecondFragment()
        destinationFragment.arguments = bundle

        findNavController().navigate(R.id.action_FirstFragment_to_SecondFragment, bundle)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
