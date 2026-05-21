// src/pages/AdminPage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";

export default function AdminPage() {
  const navigate = useNavigate();
  const { adminMode } = useAdmin(); // Print All removed

  const [isResetting, setIsResetting] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState(null);
  const [teamsProgress, setTeamsProgress] = useState({ done: 0, total: 0 });
  const [gamesProgress, setGamesProgress] = useState({ done: 0, total: 0 });

  // Redirect if admin mode is off
  useEffect(() => {
    if (!adminMode) {
      navigate("/");
    }
  }, [adminMode, navigate]);

  // Poll reset status
  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `https://notsopro-backend.onrender.com/api/reset-status?jobId=${jobId}`
        );
        const data = await res.json();

        if (data.error) {
          setStatus({ state: "error", message: data.error });
          setIsResetting(false);
          clearInterval(interval);
          return;
        }

        setTeamsProgress({
          done: data.teamsDone || 0,
          total: data.teamsTotal || 0,
        });

        setGamesProgress({
          done: data.gamesDone || 0,
          total: data.gamesTotal || 0,
        });

        if (data.status === "complete") {
          setStatus({ state: "complete", message: data.message });
          setIsResetting(false);
          clearInterval(interval);
        } else if (data.status === "error") {
          setStatus({ state: "error", message: data.message });
          setIsResetting(false);
          clearInterval(interval);
        } else {
          setStatus({ state: "running", message: data.message });
        }
      } catch (err) {
        console.error("Polling error:", err);
        setStatus({ state: "error", message: "Failed to poll status." });
        setIsResetting(false);
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId]);

  // Start reset
  const handleResetTournament = async () => {
    const sure = window.confirm(
      "Reset ALL tournament data? This cannot be undone."
    );
    if (!sure) return;

    const password = window.prompt("Enter admin password to confirm reset:");
    if (!password) return;

    try {
      setIsResetting(true);
      setStatus({ state: "starting", message: "Starting reset..." });

      const res = await fetch(
        "https://notsopro-backend.onrender.com/api/start-reset",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );

      const data = await res.json();

      if (!res.ok || data.error) {
        setIsResetting(false);
        setStatus({
          state: "error",
          message: data.error || "Failed to start reset.",
        });
        alert(data.error || "Failed to start reset.");
        return;
      }

      setJobId(data.jobId);
      setStatus({ state: "running", message: "Reset in progress..." });
    } catch (err) {
      console.error("Error starting reset:", err);
      setIsResetting(false);
      setStatus({ state: "error", message: "Failed to start reset." });
      alert("Failed to start reset.");
    }
  };

  const handleEmailCaptains = () => {
    alert("Email Captains' Codes feature coming soon.");
  };

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: 20 }}>
      <h1 style={{ textAlign: "center" }}>Admin Panel</h1>

      {/* Navigation */}
      <div style={{ marginTop: 20 }}>
        <button style={styles.button} onClick={() => navigate("/")}>
          Home
        </button>

        <button style={styles.button} onClick={() => navigate("/schedule")}>
          Schedule
        </button>

        <button style={styles.button} onClick={() => navigate("/standings")}>
          Standings
        </button>
      </div>

      {/* Admin Actions */}
      <div style={{ marginTop: 30 }}>
        <button
          style={{ ...styles.button, backgroundColor: "#d9534f" }}
          onClick={handleResetTournament}
        >
          🔄 Reset Tournament Data
        </button>

        <button
          style={{ ...styles.button, backgroundColor: "#6a5acd" }}
          onClick={handleEmailCaptains}
        >
          📧 Email Captains' Codes
        </button>
      </div>

      {/* Full-screen overlay */}
      {isResetting && (
        <div style={overlayStyles.backdrop}>
          <div style={overlayStyles.panel}>
            <h2>Resetting Tournament Data…</h2>
            <p>{status?.message || "Working..."}</p>

            <div style={{ marginTop: 20 }}>
              <h4>Teams</h4>
              <ProgressBar
                done={teamsProgress.done}
                total={teamsProgress.total}
              />
            </div>

            <div style={{ marginTop: 20 }}>
              <h4>Games</h4>
              <ProgressBar
                done={gamesProgress.done}
                total={gamesProgress.total}
              />
            </div>

            <p style={{ marginTop: 20, fontSize: 12, opacity: 0.7 }}>
              Please keep this page open until the reset completes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  button: {
    width: "100%",
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
    borderRadius: 8,
    border: "none",
    backgroundColor: "#0078d4",
    color: "white",
    cursor: "pointer",
  },
};

function ProgressBar({ done, total }) {
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div>
      <div
        style={{
          width: "100%",
          height: 12,
          borderRadius: 6,
          backgroundColor: "#eee",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            backgroundColor: "#0078d4",
            transition: "width 0.5s ease",
          }}
        />
      </div>
      <div style={{ marginTop: 4, fontSize: 12 }}>
        {done}/{total} ({percent}%)
      </div>
    </div>
  );
}

const overlayStyles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  panel: {
    width: "90%",
    maxWidth: 420,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    textAlign: "center",
  },
};
