package com.bohdan2505.webmap

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import java.io.File

class ArchiveAdapter(private val archiveList: List<String>) :
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