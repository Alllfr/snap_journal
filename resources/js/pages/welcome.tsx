import { Head, Link } from "@inertiajs/react";
import { useState } from "react";

export default function Welcome() {
  const [hoverBtn, setHoverBtn] = useState<string | null>(null);

  return (
    <>
      <Head title="Welcome" />
      <style>{`
        @keyframes gradientMove {
          0% { stop-color: #93c5fd; }
          50% { stop-color: #f9a8d4; }
          100% { stop-color: #93c5fd; }
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .fade-in {
          animation: fadeIn 1.2s ease-out forwards;
        }
      `}</style>

      <div style={styles.container}>
        <svg viewBox="0 0 1440 900" preserveAspectRatio="none" style={styles.curvedShape}>
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#93c5fd">
                <animate attributeName="stop-color" values="#a5d8ff;#ffccf9;#a5d8ff" dur="6s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="#f9a8d4">
                <animate attributeName="stop-color" values="#f9a8d4;#a5d8ff;#ffccf9" dur="6s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
          </defs>
          <path
            d="
              M500,0
              C 750,150 700,250 1000,300
              C 1300,350 1200,500 900,600
              C 600,700 800,850 1440,900
              L 1440,0
              Z
            "
            fill="url(#grad)"
          />
        </svg>

        <div style={styles.contentBox} className="fade-in">
          <h1 style={styles.title}>Welcome to Diary Journal</h1>
          <p style={styles.description}>
            Capture every precious moment of your life. Write your story, keep your memories, and relive your journey anytime.
          </p>

          <div style={styles.buttonRow}>
            {["login", "register"].map((btn) => (
              <Link
                key={btn}
                href={`/${btn}`}
                style={{
                  ...styles.button,
                  ...(hoverBtn === btn ? styles.buttonHover : {}),
                }}
                onMouseEnter={() => setHoverBtn(btn)}
                onMouseLeave={() => setHoverBtn(null)}
              >
                {btn === "login" ? "Log In" : "Register"}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "relative",
    height: "100vh",
    width: "100%",
    overflow: "hidden",
    background: "linear-gradient(180deg, #dbeafe 0%, #f0f9ff 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  curvedShape: {
    position: "absolute",
    inset: 0,
    zIndex: 1,
    width: "100%",
    height: "100%",
  },
  contentBox: {
    position: "relative",
    zIndex: 2,
    width: "90%",
    maxWidth: 600,
    backgroundColor: "transparent",
    borderRadius: "30px",
    padding: "40px 50px",
    textAlign: "center",
    border: "6px solid transparent",
    borderImage: "linear-gradient(45deg, #93c5fd, #f9a8d4) 1",
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
  },
  title: {
    fontSize: 36,
    fontWeight: 800,
    color: "#111827",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 28,
    lineHeight: 1.6,
  },
  buttonRow: {
    display: "flex",
    gap: 14,
    justifyContent: "center",
  },
  button: {
    padding: "12px 26px",
    borderRadius: 10,
    color: "#374151",
    textDecoration: "none",
    fontWeight: 600,
    transition: "all 0.3s ease",
    border: "2px solid transparent",
    borderImage: "linear-gradient(45deg, #93c5fd, #f9a8d4) 1",
    backgroundColor: "transparent",
  },
  buttonHover: {
    backgroundImage: "linear-gradient(45deg, #93c5fd, #f9a8d4)",
    color: "#fff",
    borderImage: "none",
  },
};
