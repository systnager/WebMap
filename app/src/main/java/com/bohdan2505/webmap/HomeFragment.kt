package com.bohdan2505.webmap

import android.annotation.SuppressLint
import android.app.Activity
import android.app.ProgressDialog
import android.content.Intent
import android.content.pm.PackageManager
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
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat.checkSelfPermission
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.bohdan2505.webmap.databinding.FragmentHomeBinding
import com.google.android.material.dialog.MaterialAlertDialogBuilder
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
    private val REQUEST_PERMISSION_CODE = 123
    private val zipMimeType = "application/zip"
    private val path_to_last_opened_map_name = "last_opened_map_name.txt"

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
                binding.emptyStateTextView.text = resources.getString(R.string.empty_list)
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
            val fileSystem = FileSystem()
            if (fileSystem.fileExists(File(appFolderPath, path_to_last_opened_map_name))) {
                val content = fileSystem.readFileContent(File(appFolderPath, path_to_last_opened_map_name)).trim()
                if (fileSystem.isFolderExists(File(mapFolderPath, content))) {
                    val dataToPass = File("$mapFolderPath/$content/", "index.html").absolutePath
                    val bundle = Bundle()
                    bundle.putString("html_path", dataToPass)

                    val destinationFragment = SecondFragment()
                    destinationFragment.arguments = bundle

                    findNavController().navigate(R.id.action_FirstFragment_to_SecondFragment, bundle)
                } else {
                    Snackbar.make(binding.root, resources.getString(R.string.access_folder_error), Snackbar.LENGTH_LONG).show()
                }
            } else {
                Snackbar.make(binding.root, resources.getString(R.string.no_recently_opened_map), Snackbar.LENGTH_LONG).show()
            }
        }

        binding.chooseFileButton.setOnClickListener {
            val intent = Intent()
                .setType("*/*")
                .setAction(Intent.ACTION_GET_CONTENT)
                .putExtra(Intent.EXTRA_MIME_TYPES, arrayOf(zipMimeType))

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                startActivityForResult(
                    Intent.createChooser(intent, resources.getString(R.string.choose_zip)),
                    pickFileRequestCode
                )
            } else {
                startActivityForResult(intent, pickFileRequestCode)
            }
        }
    }

    @RequiresApi(Build.VERSION_CODES.R)
    private val launcher: ActivityResultLauncher<Intent> =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            if (Environment.isExternalStorageManager()) {
                Snackbar.make(binding.root, resources.getString(R.string.permission_granted), Snackbar.LENGTH_LONG).show()
            } else {
                Snackbar.make(binding.root, resources.getString(R.string.access_requeired), Snackbar.LENGTH_LONG).show()
            }
        }

    private fun checkAndRequestStoragePermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R && !Environment.isExternalStorageManager()) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                val intent = Intent(Settings.ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION)

                MaterialAlertDialogBuilder(requireContext())
                    .setTitle(resources.getString(R.string.access_to_filesystem))
                    .setMessage(resources.getString(R.string.access_permission_required_warning))
                    .setPositiveButton(resources.getString(R.string.confirm)) { dialog, _ ->
                        launcher.launch(intent)
                        dialog.dismiss()
                    }
                    .setCancelable(false)
                    .show()
            }
        } else if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R){
            if ((ActivityCompat.checkSelfPermission(requireContext(), android.Manifest.permission.WRITE_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED).not()) {
                requestPermissions(
                    arrayOf(android.Manifest.permission.WRITE_EXTERNAL_STORAGE),
                    REQUEST_PERMISSION_CODE
                )
            }
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)

        if (requestCode == REQUEST_PERMISSION_CODE) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Snackbar.make(binding.root, resources.getString(R.string.permission_granted), Snackbar.LENGTH_LONG).show()
            } else {
                Snackbar.make(binding.root, resources.getString(R.string.access_requeired), Snackbar.LENGTH_LONG).show()
            }
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
                                Snackbar.make(binding.root, resources.getString(R.string.incorrect_folder_name), Snackbar.LENGTH_LONG).show()
                                return
                            } else if (fileSystem.isFolderExists(File(mapFolderPath, enteredText))) {
                                Snackbar.make(binding.root, resources.getString(R.string.folder_already_exists), Snackbar.LENGTH_LONG).show()
                                return
                            }

                            val outputFolder = File(mapFolderPath, enteredText)
                            val unzipProgressDialog = ProgressDialog(requireContext())
                            unzipProgressDialog.setProgressStyle(ProgressDialog.STYLE_HORIZONTAL)
                            unzipProgressDialog.setTitle(resources.getString(R.string.unpacking_archive))
                            unzipProgressDialog.setMessage(resources.getString(R.string.please_wait))
                            unzipProgressDialog.setCancelable(false)
                            unzipProgressDialog.max = 100
                            unzipProgressDialog.show()

                            val unzipTask = UnzipAsyncTask(
                                requireContext(),
                                File(filePath),
                                outputFolder,
                                { progress ->
                                    unzipProgressDialog.progress = progress
                                }
                            ) {
                                unzipProgressDialog.dismiss()
                                binding.emptyStateTextView.text = ""
                                archivesList.add(enteredText)
                                archiveAdapter.notifyDataSetChanged()
                                Snackbar.make(
                                    binding.root,
                                    resources.getString(R.string.archive_unpacked),
                                    Snackbar.LENGTH_LONG
                                ).show()
                            }
                            unzipTask.execute()
                        }
                    })
                    textInputDialog.showDialog(resources.getString(R.string.enter_folder_name), resources.getString(R.string.confirm), resources.getString(R.string.cancel))
                } else {
                    archiveAdapter.notifyDataSetChanged()
                    Snackbar.make(binding.root, resources.getString(R.string.choose_zip), Snackbar.LENGTH_SHORT).show()
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
                binding.emptyStateTextView.text = resources.getString(R.string.empty_list)
            }
            if (folderName == fileSystem.readFileContent(File(appFolderPath, path_to_last_opened_map_name)).trim()) {
                fileSystem.deleteFile(File(appFolderPath, path_to_last_opened_map_name))
            }
            Snackbar.make(binding.root, resources.getString(R.string.folder_deleted), Snackbar.LENGTH_SHORT).show()
        } else {
            Snackbar.make(binding.root, resources.getString(R.string.could_not_renamed_folder), Snackbar.LENGTH_SHORT).show()
        }
    }

    private fun onEditFolder(folderName: String) {
        val textInputDialog = TextInputDialog(binding.root.context)
        val fileSystem = FileSystem()
        textInputDialog.setOnTextEnteredListener(object : TextInputDialog.OnTextEnteredListener {
            @SuppressLint("NotifyDataSetChanged")
            override fun onTextEntered(enteredText: String) {
                if (!fileSystem.isValidFolderName(enteredText)) {
                    Snackbar.make(binding.root, resources.getString(R.string.incorrect_folder_name), Snackbar.LENGTH_LONG).show()
                    return
                } else if (fileSystem.isFolderExists(File(mapFolderPath, enteredText))) {
                    Snackbar.make(binding.root, resources.getString(R.string.folder_already_exists), Snackbar.LENGTH_LONG).show()
                    return
                }

                if (fileSystem.renameFolder(File(mapFolderPath, folderName), File(mapFolderPath, enteredText))) {
                    if (folderName == fileSystem.readFileContent(File(appFolderPath, path_to_last_opened_map_name)).trim()) {
                        fileSystem.writeToFile(File(appFolderPath, path_to_last_opened_map_name), enteredText)
                    }
                    val index = archivesList.indexOf(folderName)
                    archivesList[index] = enteredText
                    archiveAdapter.notifyDataSetChanged()
                    Snackbar.make(binding.root, resources.getString(R.string.folder_renamed), Snackbar.LENGTH_LONG).show()
                } else {
                    Snackbar.make(binding.root, resources.getString(R.string.could_not_renamed_folder), Snackbar.LENGTH_LONG).show()
                }
            }
        })
        textInputDialog.showDialog(resources.getString(R.string.enter_folder_name), resources.getString(R.string.confirm), resources.getString(R.string.cancel))
    }

    private fun onFolderItemClick(folderName: String) {
        val fileSystem = FileSystem()
        val dataToPass = File("$mapFolderPath/$folderName/", "index.html").absolutePath
        val bundle = Bundle()
        bundle.putString("html_path", dataToPass)

        fileSystem.writeToFile(File(appFolderPath, path_to_last_opened_map_name), folderName)

        val destinationFragment = SecondFragment()
        destinationFragment.arguments = bundle

        findNavController().navigate(R.id.action_FirstFragment_to_SecondFragment, bundle)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
