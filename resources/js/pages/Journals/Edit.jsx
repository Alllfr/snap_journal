import React, { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import "../../../css/journal-edit.css";
import { FaPaperPlane } from "react-icons/fa";

export default function Edit({ journal, auth }) {
  const csrfToken =
    document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";

  const { data, setData, put, processing, errors } = useForm({
    title: journal.title || "",
    note: journal.note || "",
  });

  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatting, setIsChatting] = useState(false);

  const rawTags = journal.tags?.tags ?? journal.tags ?? [];
  const tagList = Array.isArray(rawTags)
    ? rawTags.map((t) => (typeof t === "string" ? t : t?.name ?? t?.tag ?? t?.tags ?? ""))
    : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    put(`/journals/${journal.id}`, { preserveScroll: true });
  };

  const stripHTML = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const handleEnhance = async () => {
    if (isEnhancing) return;

    setIsEnhancing(true);
    try {
      await fetch(`/journals/${journal.id}`, {
        method: "POST",
        headers: {
          "X-CSRF-TOKEN": csrfToken,
          "X-HTTP-Method-Override": "PUT",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const res = await fetch(`/journals/${journal.id}/enhance`, {
        method: "POST",
        headers: {
          "X-CSRF-TOKEN": csrfToken,
          Accept: "application/json",
        },
      });

        const json = await res.json();
        const summary = json.summary || "";
        const highlight = json.highlight || "";
        const suggestion = json.suggestion || "";

        const firstMessage = `
        Highlight:
        ${highlight || "-"}

        The first question!
        ${suggestion || "-"}
        `;

        setChatHistory([
          { role: "assistant", content: firstMessage }
        ]);

        setIsEnhanced(true);
        setTimeout(() => setChatOpen(true), 250);
      } catch (e) {
        console.error(e);
      } finally {
        setIsEnhancing(false);
      }
    };

    const handleChatSend = async (message) => {
      if (!message.trim() || isChatting) return;

      const updated = [...chatHistory, { role: "user", content: message }];
      setChatHistory(updated);
      setIsChatting(true);

      try {
        const res = await fetch(`/journals/${journal.id}/chat-ask`, {
          method: "POST",
          headers: {
          "X-CSRF-TOKEN": csrfToken,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ user_input: message, chat_history: updated }),
      });

      const json = await res.json();

      let reply =
        json.assistant_response ||
        json.response ||
        json.message ||
        json.answer ||
        json.text ||
        "…";

      if (typeof reply !== "string") {
        if (reply && typeof reply === "object") {
          reply = reply.assistant_response || JSON.stringify(reply, null, 2);
        } else {
          reply = String(reply);
        }
      }

      const formattedReply = reply.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

      setChatHistory((prev) => [...prev, { role: "assistant", content: formattedReply }]);
    } catch (e) {
      console.error(e);
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: "Error: gagal terhubung ke AI." },
      ]);
    } finally {
      setIsChatting(false);
    }
  };

  const customUploadAdapter = (loader) => ({
    upload: () =>
      loader.file.then((file) => {
        const formData = new FormData();
        formData.append("upload", file);

        return fetch("/journals/upload-photo", {
          method: "POST",
          body: formData,
          headers: {
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRF-TOKEN": csrfToken,
          },
          credentials: "same-origin",
        })
          .then((res) => res.json())
          .then((res) => ({ default: res.url }));
      }),
  });

  function uploadPlugin(editor) {
    editor.plugins.get("FileRepository").createUploadAdapter = (loader) =>
      customUploadAdapter(loader);
  }

  return (
    <div className={`split-wrapper ${chatOpen ? "split-active" : ""}`}>
      <Head title="Edit Journal" />

      <div className="left-pane">
        <div className="journal-edit-card">
          <div className="center-header">
            <h1 className="journal-edit-title">Edit Journal</h1>

            <div className="journal-tags">
              {tagList.map((tag, i) => (
                <div key={i} className="tag-chip">
                  {tag}
                </div>
              ))}
            </div>

            <div className="media-grid">
              <div className="media-row">
                {journal.video_url && (
                  <video src={journal.video_url} controls className="video-box" />
                )}
                {journal.expression && (
                  <div className="expression-box">
                    <strong>Your Expression:</strong> {journal.expression} (
                    {(journal.similarity * 100).toFixed(2)}%)
                  </div>
                )}
              </div>

              <div className="media-row">
                {journal.illustrator_urls && (
                  <img
                    src={journal.illustrator_urls}
                    className="illustrator-box"
                    alt="Journal Illustration"
                  />
                )}
                {journal.emotion && (
                  <div className="emotion-box wide">
                    <strong>Detected Emotion:</strong> {journal.emotion} (
                    {(journal.confidence * 100).toFixed(2)}%)
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="journal-edit-form">
            <label>Title</label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => setData("title", e.target.value)}
              required
            />
            {errors.title && <p className="error-text">{errors.title}</p>}

            <label>Note</label>
            <CKEditor
              editor={ClassicEditor}
              data={data.note}
              onChange={(e, editor) => setData("note", editor.getData())}
              config={{ extraPlugins: [uploadPlugin] }}
            />
            {errors.note && <p className="error-text">{errors.note}</p>}

            <div className="journal-edit-actions">
              <Link href="/journals" className="btn-red">
                Cancel
              </Link>

              <button
                type="button"
                onClick={handleEnhance}
                disabled={isEnhancing}
                className="journal-edit-btn-pink"
              >
                {isEnhancing
                  ? "Enhancing..."
                  : isEnhanced
                  ? "Enhance Again"
                  : "Save & Enhance"}
              </button>

              <button type="submit" onClick={handleSubmit} className="btn-green">
                {processing ? "Saving..." : "Save Journal"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="right-pane">
        <div className="chat-room">
          <div className="chat-header">
            <span>AI Assistant</span>
            <button className="chat-close" onClick={() => setChatOpen(false)}>
              ✕
            </button>
          </div>

          <div className="chat-body">
            {chatHistory.length === 0 ? (
              <div className="chat-placeholder">AI is ready to help 💬</div>
            ) : (
              chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`chat-bubble ${
                    msg.role === "user" ? "user-bubble" : "ai-bubble"
                  }`}
                  style={{ whiteSpace: "pre-line" }}
                >
                  <strong>{msg.role === "user" ? `${auth?.user?.name || "You"}: ` : "AI: "}</strong>
                  {msg.content}
                </div>
              ))
            )}
          </div>

          <div className="chat-input">
            <input
              type="text"
              id="chatMessage"
              disabled={isChatting}
              placeholder={isChatting ? "AI is thinking..." : "Type message..."}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isChatting && e.target.value.trim()) {
                  handleChatSend(e.target.value);
                  e.target.value = "";
                }
              }}
            />
            <button
              className="send-btn"
              disabled={isChatting}
              onClick={() => {
                const input = document.getElementById("chatMessage");
                if (input.value.trim()) {
                  handleChatSend(input.value);
                  input.value = "";
                }
              }}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
