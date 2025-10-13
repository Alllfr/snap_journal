export default function UploadAdapter(loader) {
  return {
    upload: () =>
      new Promise((resolve, reject) => {
        loader.file.then((file) => {
          const formData = new FormData();
          formData.append("upload", file);

          fetch("/journals/upload", {
            method: "POST",
            body: formData,
            headers: {
              "X-CSRF-TOKEN": document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content"),
            },
          })
            .then((res) => res.json())
            .then((res) => {
              if (res.url) {
                resolve({ default: res.url }); // CKEditor butuh format ini
              } else {
                reject("Upload failed: no URL returned");
              }
            })
            .catch((err) => reject(err));
        });
      }),

    abort: () => {
      // opsional: handle cancel upload
    },
  };
}

export function UploadPlugin(editor) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader) =>
    new UploadAdapter(loader);
}
