import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bohdan2505.webmap.R

class ArchiveAdapter(private val archives: List<String>) : RecyclerView.Adapter<ArchiveAdapter.ViewHolder>() {

    class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val archiveName: TextView = itemView.findViewById(R.id.archiveName)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_archive, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val archive = archives[position]
        holder.archiveName.text = archive
    }

    override fun getItemCount(): Int {
        return archives.size
    }
}
