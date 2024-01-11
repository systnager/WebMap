package com.bohdan2505.webmap

import android.app.AlertDialog
import android.content.Context
import android.widget.EditText
import android.widget.LinearLayout

class TextInputDialog(context: Context, title: String, positiveButtonLabel: String, negativeButtonLabel: String) {

    private val editText = EditText(context)

    var onTextEnteredListener: ((String) -> Unit)? = null

    init {
        val layout = LinearLayout(context)
        layout.orientation = LinearLayout.VERTICAL
        layout.addView(editText)

        val dialog = AlertDialog.Builder(context)
            .setTitle(title)
            .setView(layout)
            .setPositiveButton(positiveButtonLabel) { _, _ ->
                val enteredText = editText.text.toString()
                onTextEnteredListener?.invoke(enteredText)
            }
            .setNegativeButton(negativeButtonLabel) { dialog, _ ->
                dialog.dismiss()
            }
            .create()

        dialog.show()
    }
}
