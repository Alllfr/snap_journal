import React from "react";
import MoodCalendar from "../Components/MoodCalendar";
import { router } from "@inertiajs/react";

export default function MoodCalendarPage({ month, calendar }) {
    const handleChange = (e) => {
        router.get("/mood-calendar", { month: e.target.value });
    };

    const goHome = () => {
        router.get("/journals");
    };

    const monthNames = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
    ];

    const months = monthNames.map((name, i) => {
        const m = (i + 1).toString().padStart(2, "0");
        return {
            label: name,
            value: `${new Date().getFullYear()}-${m}`,
        };
    });

    return (
        <div className="p-4 relative">
            <style>{`
                .pastel-select {
                    background: linear-gradient(135deg,#fbe7f3,#e6f7fa);
                    padding: 10px 14px;
                    border-radius: 999px;
                    font-size: 12px;
                    color: #333;
                    border: 1px solid rgba(0,0,0,0.05);
                    outline: none;
                    cursor: pointer;
                    margin-top: 50px;
                    margin-left: 120px;
                }

                .pastel-select:hover {
                    background: linear-gradient(135deg,#ffc7e6,#c7e8ff);
                }

              .home-btn {
              position: absolute;
              top: 51px;
              left: 70px;
              padding: 0.45rem 0.55rem;
              border-radius: 10px;
              background: linear-gradient(135deg, #a8edea, #fed6e3);
              box-shadow: 0 0 10px rgba(255, 182, 193, 0.45);
              display: flex;
              justify-content: center;
              align-items: center;
              cursor: pointer;
              transition: transform 0.2s ease;
              width:30px;
              height:35px;
            }

            .home-btn:hover {
              transform: scale(1.05);
            }

            `}</style>

            <svg
                className="home-btn"
                onClick={goHome}
                width="28"
                height="28"
                viewBox="0 0 24 24"
            >
                <defs>
                    <linearGradient id="gradHome" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f0b4d8ff" />
                        <stop offset="100%" stopColor="#5ecde0ff" />
                    </linearGradient>
                </defs>

                <path
                    d="M12 3l9 8h-3v10h-5V14H11v7H6V11H3l9-8z"
                    fill="url(#gradHome)"
                />
            </svg>

            <select
                className="pastel-select mb-4"
                defaultValue=""
                onChange={handleChange}
            >
                <option value="" disabled>Select Month</option>
                {months.map((m) => (
                    <option key={m.value} value={m.value}>
                        {m.label}
                    </option>
                ))}
            </select>

            <MoodCalendar month={month} calendar={calendar} />
        </div>
    );
}
