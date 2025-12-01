import React from "react"
import { Link } from "@inertiajs/react"
import { FaHome } from "react-icons/fa"

export default function MoodCalendarPage({ calendar, month }) {
  const emotionBorder = {
    happy: "#ffd76b",
    sad: "#a8b4ff",
    angry: "#ff9ba8",
    shocked: "#ffdf7f",
    neutral: "#dcdcdc",
  }

  const pastelBorders = ["#ffe8a3", "#fbc2eb", "#c4f7c4", "#d8c4ff"]
  const getRandomPastel = () =>
    pastelBorders[Math.floor(Math.random() * pastelBorders.length)]

  const monthText = new Date(month + "-01").toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  return (
    <div>
      <style>{`
        body {
          background: #ffffff;
        }

        .home-btn {
          position: absolute;
          top: 51px;
          left: 70px;
          padding: 0.45rem 0.55rem;
          border-radius: 8px;
          background: linear-gradient(135deg, #a8edea, #fed6e3);
          box-shadow: 0 0 10px rgba(255,182,193,0.4);
          display: flex;
          justify-content: center;
          align-items: center;
          transition: transform 0.2s ease;
        }

        .home-btn:hover {
          transform: translateY(-2px);
        }

        .home-icon {
          width: 24px;
          height: 22px;
          fill: #f3a6c6ff;
        }

        .mood-calendar-title {
          text-align: center;
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 10px;
          background: linear-gradient(135deg,#ffb6d9,#b3e5ff);
          -webkit-background-clip: text;
          color: transparent;
        }

        .month-box {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 6px auto 30px auto;
          padding: 10px 26px;
          border-radius: 16px;
          background: #ffffff;
          border: 2px dashed rgba(255,182,219,0.85);
          font-size: 20px;
          font-weight: 700;
          width: fit-content;
        }

        .month-box-text {
          background: linear-gradient(135deg,#ffb6d9,#b3e5ff);
          -webkit-background-clip: text;
          color: transparent;
        }

        .mood-calendar-grid {
          display: grid;
          grid-template-columns: repeat(7,1fr);
          gap: 12px;
          padding: 10px 20px 40px 20px;
        }

        .mood-day-cell {
          border-radius: 16px;
          padding: 12px;
          min-height: 84px;
          transition: 0.25s ease;
          display: flex;
          flex-direction: column;
          border: 3px dashed;
          background: rgba(255,255,255,0.9);
          box-shadow: 0 6px 16px rgba(0,0,0,0.05);
        }

        .mood-day-cell:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 24px rgba(0,0,0,0.07);
        }

        .day-number {
          font-weight: 700;
          margin-bottom: 6px;
          color: #333;
        }

        .emotion-label {
          margin-top: auto;
          font-size: 13px;
          font-weight: 600;
          text-transform: capitalize;
          opacity: 0.9;
        }

        .emotion-happy { background: #fff8e3 !important; }
        .emotion-sad { background: #eef2ff !important; }
        .emotion-angry { background: #ffe6ea !important; }
        .emotion-shocked { background: #fff8d6 !important; }
        .emotion-neutral { background: #fafafa !important; }
      `}</style>

      <Link href="/journals" className="home-btn">
        <FaHome className="home-icon" />
      </Link>

      <h2 className="mood-calendar-title">Your Mood This Month</h2>

      <div className="month-box">
        <span className="month-box-text">{monthText}</span>
      </div>

      <div className="mood-calendar-grid">
        {Object.entries(calendar).map(([date, data]) => {
          const emotionClass = data.has_entry ? `emotion-${data.expression}` : ""
          const borderColor = data.has_entry
            ? emotionBorder[data.expression] || getRandomPastel()
            : getRandomPastel()

          return (
            <div
              key={date}
              className={`mood-day-cell ${emotionClass}`}
              style={{ borderColor }}
            >
              <div className="day-number">{date.split("-")[2]}</div>
              <div className="emotion-label">
                {data.has_entry ? data.expression : "No entry"}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
