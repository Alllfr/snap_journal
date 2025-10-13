import React, { useRef, useState, useEffect } from "react";
import "../../../css/journal.css";
import { Link, usePage } from "@inertiajs/react";
import { FaLock, FaBook, FaImages, FaLightbulb, FaBell } from "react-icons/fa";
import axios from "axios";
import { messaging } from "@/firebase";
import { getToken, onMessage } from "firebase/messaging";

export default function Index() {
  const { journals, auth, unreadCount } = usePage().props;
  const journalRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => console.log("Service Worker registered:", registration))
        .catch((err) => console.error("Service Worker registration failed:", err));
    }
  }, []);

  useEffect(() => {
    if (journalRef.current) {
      window.scrollTo({ top: journalRef.current.offsetTop, behavior: "auto" });
    }
  }, [journals]);

  useEffect(() => {
    async function setupFCM() {
      try {
        const registration = await navigator.serviceWorker.ready;
        const token = await getToken(messaging, {
          vapidKey:
            "BGwBYYOnhmh5rlRLMe7M-5KflbrudREZWs7Lw-qQWrxiYXWHktGpKR4iWYrlsAQ7i_9XZy0SZ4mS6FzXWqrjQ1I",
          serviceWorkerRegistration: registration,
        });
        if (token) {
          await axios.post("/save-fcm-token", { token });
        }
      } catch (error) {
        console.error("Error saving FCM token:", error);
      }
      onMessage(messaging, (payload) => {
        const { title, body } = payload.notification;
        new Notification(title, { body });
      });
    }
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        setupFCM();
      }
    });
  }, []);

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const filteredJournals = journals.filter((journal) => {
    const q = searchQuery.toLowerCase();
    return (
      journal.title?.toLowerCase().includes(q) ||
      journal.note?.toLowerCase().includes(q) ||
      journal.emotion?.toLowerCase().includes(q)
    );
  });

  const renderIllustrations = (journal) => {
    if (!journal.illustrator_urls || journal.illustrator_urls.length === 0) return null;
    return (
      <div className="grid grid-cols-2 gap-2 mt-3 w-full">
        {journal.illustrator_urls.map((url, idx) => (
          <img
            key={idx}
            src={url}
            alt={`illustration-${journal.id}-${idx}`}
            className="w-full h-32 object-cover rounded shadow-sm"
          />
        ))}
      </div>
    );
  };

  const renderPhotoUpload = (journal) => {
    if (!journal.photo_url) return null;
    return (
      <div className="flex justify-center mt-3 w-full">
        <img
          src={journal.photo_url}
          alt={`photo-${journal.id}`}
          className="max-h-60 object-contain rounded shadow-sm"
        />
      </div>
    );
  };

  const renderCkeditorImage = (note, title) => {
    if (!note) return null;
    const parser = new DOMParser();
    const doc = parser.parseFromString(note, "text/html");
    const img = doc.querySelector("img");
    if (!img) return null;
    const src = img.getAttribute("src");
    return (
      <div className="flex justify-center mt-3 w-full">
        <img
          src={src}
          alt={title}
          className="max-h-60 object-contain rounded shadow-sm"
        />
      </div>
    );
  };

  return (
    <div>
      <div className="dashboard-container">
        <nav className="dashboard-nav">
          <h1 className="dashboard-title">{auth?.user?.name + "'s Diary"}</h1>
          <div className="nav-buttons">
            <div className="relative">
              <Link href={route("notifications.index")} className="btn-bell">
                <FaBell />
                {unreadCount > 0 && (
                  <span className="notif-badge">{unreadCount}</span>
                )}
              </Link>
            </div>
            <button
              onClick={() =>
                journalRef.current &&
                window.scrollTo({
                  top: journalRef.current.offsetTop,
                  behavior: "auto",
                })
              }
              className="btn-gradient-border"
            >
              My Journal
            </button>
            <Link
              href="/logout"
              method="post"
              as="button"
              className="btn-gradient-border"
            >
              Logout
            </Link>
          </div>
        </nav>

        <img src="/storage/emotions.jpg" alt="Emotion" className="emotion-image" />

        <div className="dashboard-content text-justify leading-relaxed">
          <p className="dashboard-welcome-text">
            Welcome back, {auth?.user?.name || "Guest"}! This is your personal
            space to record your thoughts, reflect on your daily activities, and
            store meaningful memories in a secure and private environment.
          </p>
          <p className="dashboard-welcome-text">
            In the <strong>My Journal</strong> section, you can easily add new
            entries, attach photos or short videos, and revisit your past
            reflections anytime you want. Your journal is a safe space — only
            you have access to it.
          </p>
          <p className="dashboard-welcome-text">
            Remember — great journeys often begin with small steps. Start
            writing today and watch your personal archive of experiences grow.
          </p>
        </div>

        <div className="dashboard-icons-container">
          <div className="dashboard-icon-card">
            <div className="icon-wrapper green">
              <FaLock />
            </div>
            <div>
              <h3>Private & Secure</h3>
              <p>
                All your journal entries are protected and only accessible by
                you, ensuring your memories stay safe.
              </p>
            </div>
          </div>
          <div className="dashboard-icon-card">
            <div className="icon-wrapper pink">
              <FaBook />
            </div>
            <div>
              <h3>Daily Reflections</h3>
              <p>
                Write about your day, track your feelings, and document your
                journey of growth.
              </p>
            </div>
          </div>
          <div className="dashboard-icon-card">
            <div className="icon-wrapper lilac">
              <FaImages />
            </div>
            <div>
              <h3>Media Memories</h3>
              <p>
                Attach photos and generated illustrations to make your stories
                come alive visually.
              </p>
            </div>
          </div>
          <div className="dashboard-icon-card">
            <div className="icon-wrapper teal">
              <FaLightbulb />
            </div>
            <div>
              <h3>Creative Freedom</h3>
              <p>
                Use your journal for goal setting, idea brainstorming, dream
                recording, or anything inspiring.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div ref={journalRef} className="journal-containers">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8 w-full">
          <h1 className="journal-title text-3xl font-bold text-gray-800 w-full md:w-auto text-center md:text-left">
            My Journal
          </h1>
          <div className="flex-1 flex justify-center md:justify-center">
            <input
              type="text"
              placeholder="Search by title, note, or detected emotion..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="journal-search w-full max-w-md px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>
          <div className="flex justify-center md:justify-end w-full md:w-auto">
            <Link
              href="/journals/create"
              className="btn-gradient-border px-4 py-2 rounded-full min-w-[130px] text-center font-medium"
            >
              + Add Journal
            </Link>
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <div className="journal-list grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
            {filteredJournals.length === 0 ? (
              <p className="text-gray-600 text-center w-full">No journals found.</p>
            ) : (
              filteredJournals.map((journal) => {
                const noteContent = journal.note || "";
                const plainText = noteContent.replace(/<[^>]+>/g, "");
                const shortText =
                  plainText.length > 40
                    ? plainText.substring(0, 40) + "..."
                    : plainText;

                return (
                  <div
                    key={journal.id}
                    className="journal-item border rounded p-4 shadow-sm bg-white flex flex-col items-center text-center"
                  >
                    <h2 className="font-bold text-lg mb-2">{journal.title}</h2>
                    {renderIllustrations(journal)}
                    {renderPhotoUpload(journal)}
                    {renderCkeditorImage(noteContent, journal.title)}
                    {noteContent && (
                      <div className="text-gray-700 mt-2 text-justify w-full">
                        <p>{shortText}</p>
                      </div>
                    )}
                    <div className="mt-3 text-sm text-gray-700">
                      <p>
                        Detected Emotion:{" "}
                        <span className="font-semibold">
                          {journal.emotion || "-"}
                        </span>
                      </p>
                      <p>
                        Confidence:{" "}
                        {journal.confidence !== null
                          ? `${journal.confidence.toFixed(0)}%`
                          : "-"}
                      </p>
                      <p>
                        Last Modified:{" "}
                        <span className="font-medium">
                          {journal.last_modified || "-"}
                        </span>
                      </p>
                    </div>
                    <div className="mt-4 flex gap-3 justify-center w-full">
                      <Link
                        href={`/journals/${journal.id}/edit`}
                        className="btn-pink min-w-[120px]"
                      >
                        Read More
                      </Link>
                      <Link
                        as="button"
                        method="delete"
                        href={`/journals/${journal.id}`}
                        className="btn-pink min-w-[120px]"
                      >
                        Delete
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <style>{`
        .btn-bell {
          position: relative;
          font-size: 1.5rem;
          color: #333;
          background: transparent;
          border: none;
          cursor: pointer;
          margin-right: 0.75rem;
          transition: transform 0.2s ease;
        }
        .btn-bell:hover {
          transform: scale(1.1);
        }
        .notif-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ff6b6b;
          color: white;
          font-size: 0.65rem;
          font-weight: bold;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}
