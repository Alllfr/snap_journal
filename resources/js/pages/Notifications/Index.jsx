import React from "react"
import { Head, router } from "@inertiajs/react"

export default function Index({ notifications }) {
  const allRead = notifications.every((n) => n.read_at)

  const handleMarkAsRead = () => {
    router.post(route("notifications.markAsRead"), {}, {
      preserveScroll: true,
      onSuccess: () => console.log("Notifications marked as read"),
    })
  }

  const handleDelete = (id) => {
    if (confirm("Delete this notification?")) {
      router.delete(route("notifications.destroy", id), {
        preserveScroll: true,
        onSuccess: () => console.log("Notification deleted"),
      })
    }
  }

  return (
    <div className="notification-container">
      <Head title="Notification History" />

      <div className="notification-card">
        <div className="header-row">
          <h1 className="notification-title">Notification History</h1>
          {notifications.length > 0 && (
            <button onClick={handleMarkAsRead} className="btn-pinkk">
              {allRead ? "All read ✓" : "Mark all as read"}
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <p className="no-notif-text">No notifications yet.</p>
        ) : (
          <div className="notification-list">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`notification-item ${n.read_at ? "read" : "unread"}`}
              >
                <div className="notif-header">
                  <h2 className="notif-title">{n.title}</h2>
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="btn-red"
                  >
                    Delete
                  </button>
                </div>
                <p className="notif-message">{n.message}</p>
                <small className="notif-date">{n.created_at}</small>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .notification-container {
          min-height: 100vh;
          padding: 2rem;
          background: #fff;
          background-size: 600% 600%;
          animation: gradientMove 5s ease infinite;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }

        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .notification-card {
          background: white;
          border: 2px dashed rgba(255, 153, 153, 0.6);
          border-radius: 15px;
          padding: 2rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          width: 100%;
          max-width: 800px;
        }

        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .notification-title {
          font-size: 2.3rem;
          font-weight: 700;
          color: #333;
          animation: fadeSlideIn 1.2s ease forwards;
        }

        @keyframes fadeSlideIn {
          0% { opacity: 0; transform: translateY(10px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        .notification-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .notification-item {
          border: 2px dashed rgba(255, 240, 27, 0.6);
          border-radius: 12px;
          padding: 1rem 1.25rem;
          background: #fffbe6;
          transition: transform 0.2s ease;
        }

        .notification-item:hover {
          transform: translateY(-2px);
        }

        .notification-item.read {
          background: #f9f9f9;
          opacity: 0.8;
        }

        .notif-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .notif-title {
          font-weight: 600;
          font-size: 1.1rem;
          color: #333;
          margin: 0;
        }

        .notif-message {
          color: #555;
          margin: 0.25rem 0 0.5rem;
        }

        .notif-date {
          color: #777;
          font-size: 0.85rem;
        }

        .no-notif-text {
          text-align: center;
          color: #777;
          font-size: 1rem;
          margin-top: 2rem;
        }

        .btn-pinkk{
          background: linear-gradient(135deg, #fbc2eb, #a6c1ee);
          color: #333;
          padding: 0.3rem 0.75rem;
          font-size: 0.8rem;
          border-radius: 6px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-block;
          width: auto;
        }
        .btn-pinkk:hover{
          background: linear-gradient(135deg, #a8edea, #fed6e3);
          transform: translateY(-1px);
        }

        .btn-red {
          background: linear-gradient(135deg, #ff9a9e, #fecfef);
          color: #333;
          padding: 0.25rem 0.6rem;
          font-size: 0.75rem;
          border-radius: 6px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-red:hover {
          background: linear-gradient(135deg, #ff758c, #ff7eb3);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  )
}
