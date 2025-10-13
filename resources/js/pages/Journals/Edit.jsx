import React, { useState } from "react"
import { Head, Link, useForm } from "@inertiajs/react"
import { CKEditor } from "@ckeditor/ckeditor5-react"
import ClassicEditor from "@ckeditor/ckeditor5-build-classic"
import "../../../css/journal-edit.css"
import { FaPaperPlane } from "react-icons/fa"

export default function Edit({ journal, auth }) {
  const { data, setData, put, processing, errors } = useForm({
    title: journal.title || "",
    note: journal.note || "",
  })

  const [isEnhancing, setIsEnhancing] = useState(false)
  const [isEnhanced, setIsEnhanced] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const [isChatting, setIsChatting] = useState(false)

  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""

  const handleSubmit = (e) => {
    e.preventDefault()
    put(`/journals/${journal.id}`, { preserveScroll: true })
  }

  const stripHTML = (html) => {
    const div = document.createElement("div")
    div.innerHTML = html
    return div.textContent || div.innerText || ""
  }

  const handleEnhance = async () => {
    if (isEnhancing) return
    setIsEnhancing(true)
    try {
      const saveRes = await fetch(`/journals/${journal.id}`, {
        method: "POST",
        headers: {
          "X-CSRF-TOKEN": csrfToken,
          "X-HTTP-Method-Override": "PUT",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "same-origin",
      })
      if (!saveRes.ok) throw new Error("Save failed")

      const enhanceRes = await fetch(`/journals/${journal.id}/enhance`, {
        method: "POST",
        headers: { "X-CSRF-TOKEN": csrfToken, Accept: "application/json" },
        credentials: "same-origin",
      })
      const json = await enhanceRes.json().catch(() => ({}))
      const highlight = json.highlight || "-"
      const elaborated = stripHTML(json.elaborated_text || "-")
      if (elaborated && elaborated !== "-") setData("note", elaborated)
      setChatHistory([
        {
          role: "assistant",
          content: `🌟 Highlight: ${highlight}\n💬 ${elaborated}`,
        },
      ])
      setIsEnhanced(true)
      setTimeout(() => setChatOpen(true), 250)
    } catch (err) {
      console.error(err)
    } finally {
      setIsEnhancing(false)
    }
  }

  const handleChatSend = async (message) => {
    if (!message.trim() || isChatting) return
    const newHistory = [...chatHistory, { role: "user", content: message }]
    setChatHistory(newHistory)
    setIsChatting(true)
    try {
      const res = await fetch(`/journals/${journal.id}/chat-ask`, {
        method: "POST",
        headers: {
          "X-CSRF-TOKEN": csrfToken,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          user_input: message,
          chat_history: newHistory,
        }),
      })
      const data = await res.json().catch(() => ({}))
      const reply =
        data.assistant_response ||
        data.response ||
        data.message ||
        data.answer ||
        data.text ||
        null
      if (reply) {
        setChatHistory((prev) => [...prev, { role: "assistant", content: reply }])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsChatting(false)
    }
  }

  const customUploadAdapter = (loader) => ({
    upload: () =>
      loader.file.then((file) => {
        const formData = new FormData()
        formData.append("upload", file)
        return fetch("/journals/upload", {
          method: "POST",
          body: formData,
          headers: {
            "X-CSRF-TOKEN": csrfToken,
            "X-Requested-With": "XMLHttpRequest",
          },
          credentials: "same-origin",
        })
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
            return res.json()
          })
          .then((res) => ({ default: res.url }))
      }),
  })

  function uploadPlugin(editor) {
    editor.plugins.get("FileRepository").createUploadAdapter = (loader) =>
      customUploadAdapter(loader)
  }

  return (
    <div className={`split-wrapper ${chatOpen ? "split-active" : ""}`}>
      <Head title="Edit Journal" />
      <div className="left-pane">
        <div className="journal-edit-card" style={{ transform: chatOpen ? "translateX(200px)" : "none" }}>
          <div className="center-header">
            <h1 className="journal-edit-title">{data.title}</h1>
            {journal.tags && (
              <div className="journal-tags">
                {journal.tags.split(",").map((t, i) => (
                  <span key={i} className="tag-chip">{t.trim()}</span>
                ))}
              </div>
            )}
          </div>
          <div className="illustrator-row">
            <div className="illustrator-box">
              {journal.illustrator_urls && journal.illustrator_urls.length > 0 ? (
                <img src={journal.illustrator_urls[0]} alt="Illustration" />
              ) : (
                <div className="illustration-placeholder">No illustration</div>
              )}
            </div>
            <div className="emotion-box">
              <p>Detected Emotion: <strong>{journal.emotion || "Neutral"}</strong></p>
              <p>Similarity: <strong>{journal.confidence ? `${journal.confidence}%` : "0%"}</strong></p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="journal-edit-form">
            <label>Note</label>
            <CKEditor
              editor={ClassicEditor}
              data={data.note}
              onChange={(e, editor) => setData("note", editor.getData())}
              config={{ extraPlugins: [uploadPlugin] }}
            />
            {errors.note && <p className="error-text">{errors.note}</p>}
            <div className="journal-edit-actions">
              <Link href="/journals" className="btn-red" style={{ minWidth: 120, marginTop: 0 }}>
                Cancel
              </Link>
              <button
                type="button"
                onClick={handleEnhance}
                disabled={isEnhancing}
                className="journal-edit-btn-pink"
                style={{ minWidth: 140 }}
              >
                {isEnhancing ? "Enhancing..." : isEnhanced ? "Enhance again" : "Save & Enhance"}
              </button>
              <button type="submit" disabled={processing} className="btn-green" style={{ minWidth: 140 }}>
                {processing ? "Saving..." : "Save Journal"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="right-pane">
        <div className="chat-room" style={{ transform: chatOpen ? "translateX(-100px)" : "none" }}>
          <div className="chat-header">
            <span>AI Assistant</span>
            <button className="chat-close" onClick={() => setChatOpen(false)}>✕</button>
          </div>
          <div className="chat-body">
            {chatHistory.length === 0 ? (
              <div className="chat-placeholder">AI is ready to help 💬</div>
            ) : (
              chatHistory.map((msg, i) => (
                <div key={i} className={`chat-bubble ${msg.role === "user" ? "user-bubble" : "ai-bubble"}`}>
                  <strong>{msg.role === "user" ? `${auth?.user?.name || "You"}:` : "AI:"}</strong>{" "}
                  {msg.content}
                </div>
              ))
            )}
          </div>
          <div className="chat-input">
            <input
              type="text"
              id="chatMessage"
              placeholder={isChatting ? "AI is thinking..." : "Type message..."}
              disabled={isChatting}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.value.trim() && !isChatting) {
                  handleChatSend(e.target.value.trim())
                  e.target.value = ""
                }
              }}
            />
            <button
              className="send-btn"
              disabled={isChatting}
              onClick={() => {
                const input = document.getElementById("chatMessage")
                if (input.value.trim()) {
                  handleChatSend(input.value.trim())
                  input.value = ""
                }
              }}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
