import React from "react"
import { Head, Link, useForm } from "@inertiajs/react"
import { CKEditor } from "@ckeditor/ckeditor5-react"
import ClassicEditor from "@ckeditor/ckeditor5-build-classic"
import "../../../css/journal-form.css"

export default function Create() {
  const { data, setData, post, processing, errors } = useForm({
    title: "",
    note: "",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    post(route("journals.store"), {
      preserveScroll: true,
      onError: (errors) => {
        console.error("Validation errors:", errors)
      },
    })
  }

  const customUploadAdapter = (loader) => {
    return {
      upload: () =>
        loader.file.then((file) => {
          const formData = new FormData()
          formData.append("upload", file)

          return fetch("/journals/upload", {
            method: "POST",
            body: formData,
            headers: {
              "X-Requested-With": "XMLHttpRequest",
              "X-CSRF-TOKEN":
                document
                  .querySelector('meta[name="csrf-token"]')
                  ?.getAttribute("content") || "",
            },
            credentials: "same-origin",
          })
            .then((res) => {
              if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`)
              }
              return res.json()
            })
            .then((res) => {
              if (res.url) {
                return { default: res.url }
              }
              throw new Error("Upload failed: No URL in response")
            })
        }),
    }
  }

  function uploadPlugin(editor) {
    editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
      return customUploadAdapter(loader)
    }
  }

  return (
    <div className="journal-container">
      <Head title="Create Journal" />

      <div className="journal-card max-w-xl mx-auto">
        <h1 className="journal-title">Create Journal</h1>

        <form onSubmit={handleSubmit} className="journal-form space-y-4">
          <div>
            <label className="block mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={data.title}
              onChange={(e) => setData("title", e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block mb-1">Note</label>
            <CKEditor
              editor={ClassicEditor}
              data={data.note}
              onChange={(event, editor) => setData("note", editor.getData())}
              config={{ extraPlugins: [uploadPlugin] }}
            />
            {errors.note && (
              <p className="text-red-500 text-sm mt-1">{errors.note}</p>
            )}
          </div>

          <div className="flex justify-between items-center mt-6">
            <Link
              href={route("journals.index")}
              className="btn-red px-4 py-2 rounded"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={processing}
              className="btn-pink px-4 py-2 rounded"
            >
              {processing ? "Saving..." : "Save Journal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
