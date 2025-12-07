import React, { useRef, useState, useEffect } from "react"
import { Head, Link, useForm } from "@inertiajs/react"
import { CKEditor } from "@ckeditor/ckeditor5-react"
import ClassicEditor from "@ckeditor/ckeditor5-build-classic"
import "../../../css/journal-form.css"

export default function Create() {
  const videoRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const recordingDurationRef = useRef(0)

  const { data, setData, post, processing, errors } = useForm({
    title: "",
    note: "",
    recorded_video: null,
  })

  const [isCapturing, setIsCapturing] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [message, setMessage] = useState("")

  const MIN_DURATION = 3
  const MAX_DURATION = 5

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      stopCamera()
    }
  }, [previewUrl])

  const startTimer = () => {
    setRecordingDuration(0)
    recordingDurationRef.current = 0
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setRecordingDuration((prev) => {
        const d = prev + 1
        recordingDurationRef.current = d
        if (d >= MAX_DURATION) stopRecording()
        return d
      })
    }, 1000)
  }

  const startCamera = async () => {
    setMessage("")
    setIsCapturing(true)
    setIsRecording(true)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      videoRef.current.srcObject = stream
      await videoRef.current.play()

      chunksRef.current = []
      const options = MediaRecorder.isTypeSupported("video/mp4;codecs=avc1")
        ? { mimeType: "video/mp4;codecs=avc1" }
        : { mimeType: "video/webm" }

      const mediaRecorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        clearInterval(timerRef.current)
        setIsRecording(false)
        stopCamera()

        if (recordingDurationRef.current < MIN_DURATION) {
          setMessage(`Video must be at least ${MIN_DURATION} seconds.`)
          setData("recorded_video", null)
          setPreviewUrl(null)
          return
        }

        const blob = new Blob(chunksRef.current, { type: options.mimeType })
        const url = URL.createObjectURL(blob)
        setPreviewUrl(url)

        const file = new File([blob], "recording.mp4", { type: options.mimeType })
        setData("recorded_video", file)
      }

      mediaRecorder.start()
      startTimer()
    } catch {
      setMessage("Camera access denied or unavailable.")
      setIsCapturing(false)
      setIsRecording(false)
    }
  }

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject
    if (stream) stream.getTracks().forEach((track) => track.stop())
    if (videoRef.current) videoRef.current.srcObject = null
    setIsCapturing(false)
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
  }

  const retakeVideo = () => {
    if (previewUrl) {
      const oldUrl = previewUrl
      setPreviewUrl(null)
      setData("recorded_video", null)
      setTimeout(() => URL.revokeObjectURL(oldUrl), 0)
    }
    startCamera()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setMessage("")
    if (!data.recorded_video) {
      setMessage("Please record a video first.")
      return
    }
    post(route("journals.store"), { forceFormData: true })
  }

 const customUploadAdapter = (loader) => {
  return {
    upload: () =>
      loader.file.then((file) => {
        const formData = new FormData()
        formData.append("upload", file)

        return fetch("/journals/upload-photo", {
          method: "POST",
          body: formData,
          headers: {
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRF-TOKEN":
              document.querySelector('meta[name="csrf-token"]').getAttribute("content"),
          },
          credentials: "same-origin",
        })
          .then((res) => res.json())
          .then((res) => ({ default: res.url }))
      }),
  }
}

  function uploadPlugin(editor) {
    editor.plugins.get("FileRepository").createUploadAdapter = (loader) =>
      customUploadAdapter(loader)
  }

  return (
    <div className="journal-container">
      <Head title="Create Journal" />
      <div className="journal-card">
        <h1 className="journal-title">Create Journal</h1>
        <form onSubmit={handleSubmit} className="journal-form">
          <div>
            <label>Title</label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => setData("title", e.target.value)}
              required
            />
            {errors.title && <p className="error-text">{errors.title}</p>}
          </div>
          <div>
            <label>Note</label>
            <CKEditor
              editor={ClassicEditor}
              data={data.note}
              onChange={(event, editor) => setData("note", editor.getData())}
              config={{ extraPlugins: [uploadPlugin] }}
            />
            {errors.note && <p className="error-text">{errors.note}</p>}
          </div>

          <div>
        <label>Record Your Emotion</label>

          <div className="start-record-row">
            {!previewUrl && !isCapturing && (
              <button type="button" onClick={startCamera} className="btn-pink">
                Start Recording
              </button>
            )}
          </div>
          
            {isCapturing && isRecording && (
              <div className="journal-preview">
                <video ref={videoRef} autoPlay muted />
                <p>Recording: {recordingDuration}s / {MAX_DURATION}s</p>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${(recordingDuration / MAX_DURATION) * 100}%` }}
                  ></div>
                </div>
                <button type="button" onClick={stopRecording} className="btn-pink">
                  Stop Recording
                </button>
              </div>
            )}

            {previewUrl && !isRecording && (
              <div className="journal-preview">
                <video src={previewUrl} controls />
                <button type="button" onClick={retakeVideo} className="btn-pink">
                  Retake Video
                </button>
              </div>
            )}

            {errors.recorded_video && <p className="error-text">{errors.recorded_video}</p>}
            {message && <p className="error-text">{message}</p>}
          </div>

          <div className="button-row">
            <Link href={route("journals.index")} className="btn-red">
              Cancel
            </Link>
            <button type="submit" disabled={processing} className="btn-pink">
              {processing ? "Saving..." : "Save Journal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
