import React, { useRef, useState, useEffect, useCallback } from "react"
import { Link, usePage } from "@inertiajs/react"
import { FaLock, FaBook, FaImages, FaLightbulb, FaGlobe, FaBell, FaCalendarAlt } from "react-icons/fa"
import axios from "axios"
import { messaging } from "@/firebase"
import { getToken, onMessage } from "firebase/messaging"

function VideoPlayer({ src, onError = () => {}, className = "", style = {} }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let obs
    try {
      obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setVisible(true)
          })
        },
        { threshold: 0.01 }
      )
      obs.observe(el)
    } catch {
      setVisible(true)
    }
    return () => obs && obs.disconnect()
  }, [])

  const forceLoad = useCallback((url) => {
    if (!url) return
    try {
      const v = document.createElement("video")
      v.preload = "auto"
      v.src = url
      v.crossOrigin = "anonymous"
      v.load()
      setTimeout(() => {
        v.src = ""
      }, 5000)
    } catch {}
  }, [])

  useEffect(() => {
    if (visible && src) forceLoad(src)
  }, [visible, src, forceLoad])

  return (
    <div ref={ref} className={`w-full ${className}`} style={{ display: "block", ...style }}>
      {src ? (
        <video
          key={src}
          src={visible ? src : undefined}
          controls
          playsInline
          preload="metadata"
          crossOrigin="anonymous"
          onError={onError}
          className="max-h-60 rounded shadow-sm block mx-auto"
          style={{ width: "100%", height: "auto" }}
        />
      ) : (
        <div className="text-sm text-red-500">No video source provided</div>
      )}
    </div>
  )
}

export default function Index() {
  const { journals = [], auth = {}, unreadCount = 0, locale = "id", translations = {} } = usePage().props
  const journalRef = useRef(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/firebase-messaging-sw.js").catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (journalRef.current) {
      window.scrollTo({ top: journalRef.current.offsetTop, behavior: "auto" })
    }
  }, [journals])

  useEffect(() => {
    async function setupFCM() {
      try {
        const registration = await navigator.serviceWorker.ready
        const token = await getToken(messaging, {
          vapidKey: "BGwBYYOnhmh5rlRLMe7M-5KflbrudREZWs7Lw-qQWrxiYXWHktGpKR4iWYrlsAQ7i_9XZy0SZ4mS6FzXWqrjQ1I",
          serviceWorkerRegistration: registration,
        })
        if (token) await axios.post("/save-fcm-token", { token }).catch(() => {})
      } catch {}
      onMessage(messaging, (payload) => {
        const { title, body } = payload.notification || {}
        try {
          new Notification(title, { body })
        } catch {}
      })
    }
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") setupFCM()
    })
  }, [])

  const switchLanguage = async (newLocale) => {
    await axios.get(`/set-locale/${newLocale}`).catch(() => {})
    window.location.reload()
  }

  const renderGCSMedia = (journal) => {
    const safeVideoUrl = journal.video_url?.trim() || null
    const safePhotoUrl = journal.photo_url?.trim() || null

    return (
      <div className="w-full mt-2">
        {safeVideoUrl ? (
          <VideoPlayer
            src={safeVideoUrl}
            onError={() => alert("VIDEO ERROR: Tidak bisa load video:\n" + safeVideoUrl)}
          />
        ) : safePhotoUrl ? (
          <div className="flex justify-center mt-3 w-full">
            <img
              src={safePhotoUrl}
              alt="journal-photo"
              className="max-h-60 object-contain rounded shadow-sm"
              loading="lazy"
            />
          </div>
        ) : null}
      </div>
    )
  }

  const renderIllustrations = (journal) => {
  const illustrations = Array.isArray(journal.illustrator)
    ? journal.illustrator
    : journal.illustrator
    ? [journal.illustrator]
    : []

  if (illustrations.length === 0) return null

  return (
    <div className="grid grid-cols-2 gap-2 mt-3 w-full">
      {illustrations.map((url, i) => (
        <img
          key={i}
          src={url}
          className="w-full h-32 object-cover rounded shadow-sm"
          alt=""
          loading="lazy"
        />
      ))}
    </div>
  )
}


  const renderCkeditorImage = (note, title) => {
    if (!note) return null
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(note, "text/html")
      const img = doc.querySelector("img")
      if (!img) return null
      return (
        <div className="flex justify-center mt-3 w-full">
          <img
            src={img.getAttribute("src")}
            alt={title}
            className="max-h-60 object-contain rounded shadow-sm"
            loading="lazy"
          />
        </div>
      )
    } catch {
      return null
    }
  }

  const filteredJournals = journals.filter((j) => {
    const q = (searchQuery || "").toLowerCase()
    return (
      (j.title || "").toLowerCase().includes(q) ||
      (j.note || "").toLowerCase().includes(q) ||
      (j.emotion || "").toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <div className="dashboard-container">
  <nav className="dashboard-nav">
    <h1 className="dashboard-title">{(auth?.user?.name || "Guest") + "'s Diary"}</h1>

    <div className="nav-buttons">

      <div className="relative">
        <Link href="/notifications" className="btn-bell">
          <FaBell style={{ width: 28, height: 28, fill: "#66ccff" }} />
          {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
        </Link>
      </div>

      <div className="language-selector">
        <button onClick={() => setShowDropdown(!showDropdown)} className="btn-bell">
          <FaGlobe style={{ width: 28, height: 28, fill: "#ff99cc" }} />
          <span className="language-text">{locale === "en" ? "EN" : "ID"}</span>
        </button>

        {showDropdown && (
          <div className="language-dropdown">
            <button onClick={() => switchLanguage("en")}>🇬🇧 English</button>
            <button onClick={() => switchLanguage("id")}>🇮🇩 Indonesia</button>
          </div>
        )}
      </div>

      <button
        onClick={() => journalRef.current && window.scrollTo({ top: journalRef.current.offsetTop })}
        className="btn-gradient-border"
      >
        {translations["my_journal"] || "My Journal"}
      </button>

      <Link href="/mood-calendar" className="btn-gradient-border">
        Mood Calendar
      </Link>

      <Link href="/logout" method="post" as="button" className="btn-gradient-border">
        {translations["logout"] || "Logout"}
      </Link>

    </div>
  </nav>


        <img src="/storage/emotions.jpg" className="emotion-image" alt="emotions" />

        <div className="dashboard-content text-justify leading-relaxed">
          <p className="dashboard-welcome-text">
            {(translations["welcome_back"] || "Welcome back, :name!").replace(
              ":name",
              auth?.user?.name || "Guest"
            )}{" "}
            {translations["welcome_message"] ||
              "This is your personal space to record your thoughts, reflect on your daily activities, and store meaningful memories in a secure environment."}
          </p>
          <p className="dashboard-welcome-text">
            {translations["journal_description"] ||
              "In the My Journal section, you can add new entries, attach photos or short videos, and revisit your past reflections anytime you want."}
          </p>
          <p className="dashboard-welcome-text">
            {translations["motivation"] || "Great journeys begin with small steps. Start writing today and watch your personal archive grow."}
          </p>
        </div>

        <div className="dashboard-icons-container">
          <div className="dashboard-icon-card">
            <div className="icon-wrapper green"><FaLock /></div>
            <div>
              <h3>{translations["private_secure_title"] || "Private & Secure"}</h3>
              <p>{translations["private_secure_desc"] || "All your journal entries are protected."}</p>
            </div>
          </div>

          <div className="dashboard-icon-card">
            <div className="icon-wrapper pink"><FaBook /></div>
            <div>
              <h3>{translations["daily_reflection_title"] || "Daily Reflections"}</h3>
              <p>{translations["daily_reflection_desc"] || "Write about your day and reflect."}</p>
            </div>
          </div>

          <div className="dashboard-icon-card">
            <div className="icon-wrapper lilac"><FaImages /></div>
            <div>
              <h3>{translations["media_memories_title"] || "Media Memories"}</h3>
              <p>{translations["media_memories_desc"] || "Attach photos and illustrations."}</p>
            </div>
          </div>

          <div className="dashboard-icon-card">
            <div className="icon-wrapper teal"><FaLightbulb /></div>
            <div>
              <h3>{translations["creative_freedom_title"] || "Creative Freedom"}</h3>
              <p>{translations["creative_freedom_desc"] || "Store goals, ideas, and inspirations."}</p>
            </div>
          </div>
        </div>
      </div>

      <div ref={journalRef} className="journal-containers">
        <div className="journal-header">
          <h1 className="journal-title">{translations["my_journal"] || "My Journal"}</h1>
          <input
            type="text"
            placeholder={translations["search_placeholder"] || "Search journal..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="journal-search border rounded px-3 py-2 w-full md:w-auto"
          />

          <Link href="/journals/create" className="btn-gradient-border">
            {translations["add_journal"] || "Add Journal"}
          </Link>
        </div>

        <div className="journal-list">
          {filteredJournals.length === 0 ? (
            <p className="text-gray-600 text-center w-full">
              {translations["no_journal_found"] || "No journals found."}
            </p>
          ) : (
            filteredJournals.map((j) => {
              const plainText = (j.note || "").replace(/<[^>]+>/g, "")
              const short = plainText.length > 40 ? plainText.substring(0, 40) + "..." : plainText
              return (
                <div key={j.id} className="journal-item">
                  <h2>{j.title}</h2>
                  {renderIllustrations(j)}
                  {renderGCSMedia(j)}
                  {renderCkeditorImage(j.note, j.title)}
                  {j.note && <p>{short}</p>}

                  <div className="flex justify-center mt-8">
                    <p style={{ fontWeight: 900 }}>Informations</p>
                  </div>

                  <div className="mt-2 text-sm text-gray-700">
                    <p>
                      {translations["detected_emotion"] || "Detected Emotion"}: {j.emotion || "-"} (
                      {j.confidence != null ? `${(Number(j.confidence) * 100).toFixed(0)}%` : "-"})
                    </p>
                    <p>
                      {translations["expression"] || "Expression"}: {j.expression || "-"} (
                      {j.similarity != null ? `${(Number(j.similarity) * 100).toFixed(0)}%` : "-"})
                    </p>
                    <p>
                      {translations["last_modified"] || "Last Modified"}: {j.last_modified || "-"}
                    </p>
                  </div>

                  <div className="button-group mt-2">
                    <Link href={`/journals/${j.id}/edit`} className="btn-pink">
                      {translations["read_more"] || "Read More"}
                    </Link>
                    <Link as="button" method="delete" href={`/journals/${j.id}`} className="btn-pink">
                      {translations["delete"] || "Delete"}
                    </Link>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
