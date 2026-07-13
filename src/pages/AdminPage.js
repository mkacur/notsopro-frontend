// src/pages/AdminPage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";

export default function AdminPage() {
  const navigate = useNavigate();
  const { adminMode } = useAdmin();

  // Reset Tournament Data states
  const [isResetting, setIsResetting] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState(null);
  const [teamsProgress, setTeamsProgress] = useState({ done: 0, total: 0 });
  const [gamesProgress, setGamesProgress] = useState({ done: 0, total: 0 });

  // Recalculate Standings states
  const [divisionList, setDivisionList] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState("");
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recalcStatus, setRecalcStatus] = useState("");
  const [divisionChecks, setDivisionChecks] = useState([]); // live checkmarks

  // Redirect if admin mode is off
  useEffect(() => {
    if (!adminMode) navigate("/");
  }, [adminMode, navigate]);

  // Load divisions for dropdown
  useEffect(() => {
    async function loadDivisions() {
      try {
        const res = await fetch("https://notsopro-backend.onrender.com/api/teams");
        const data = await res.json();

        const divisions = [...new Set(data.value.map(t => t.fields.Division))];
        divisions.sort(); // stable order
        setDivisionList(divisions);
      } catch (err) {
        console.error("Failed to load divisions:", err);
      }
    }
    loadDivisions();
  }, []);

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

  // Reset Tournament Data
  const handleResetTournament = async () => {
    const sure = window.confirm("Reset ALL tournament data? This cannot be undone.");
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

  // Recalculate Standings
  const handleRunRecalculate = async () => {
    if (!selectedDivision) {
      alert("Please select a division first.");
      return;
    }

    const divisionsToProcess =
      selectedDivision === "ALL"
        ? [...divisionList]
        : [selectedDivision];

    const sure = window.confirm(
      selectedDivision === "ALL"
        ? "Recalculate standings for ALL divisions?"
        : `Recalculate standings for ${selectedDivision}?`
    );
    if (!sure) return;

    setIsRecalculating(true);
    setRecalcStatus("Starting…");

    // Initialize checkmark list
    setDivisionChecks(
      divisionsToProcess.map(d => ({ name: d, status: "pending" }))
    );

    try {
      // Load all teams and games once
      const teamsRes = await fetch("https://notsopro-backend.onrender.com/api/teams");
      const teamsData = await teamsRes.json();

      const gamesRes = await fetch("https://notsopro-backend.onrender.com/api/games");
      const gamesData = await gamesRes.json();

      // Process each division sequentially
      for (let i = 0; i < divisionsToProcess.length; i++) {
        const division = divisionsToProcess[i];

        // Update overlay
        setRecalcStatus(`Recalculating ${division}…`);
        setDivisionChecks(prev =>
          prev.map(d =>
            d.name === division
              ? { ...d, status: "processing" }
              : d
          )
        );

        // Filter teams
        const teams = teamsData.value.filter(
          t => t.fields.Division === division
        );

        const standings = {};
        teams.forEach(t => {
          standings[t.fields.TeamName] = {
            Wins: 0,
            Losses: 0,
            For: 0,
            Ag: 0,
            Diff: 0,
            id: t.id
          };
        });

        // Filter completed games
        const completed = gamesData.value.filter(
          g =>
            g.fields.Division === division &&
            g.fields.Status === "Final"
        );

        // Recalculate
        completed.forEach(g => {
          const A = g.fields.TeamA;
          const B = g.fields.TeamB;
          const a = g.fields.ScoreA;
          const b = g.fields.ScoreB;

          standings[A].For += a;
          standings[A].Ag += b;
          if (a > b) standings[A].Wins++;
          else standings[A].Losses++;

          standings[B].For += b;
          standings[B].Ag += a;
          if (b > a) standings[B].Wins++;
          else standings[B].Losses++;
        });

        Object.values(standings).forEach(s => {
          s.Diff = s.For - s.Ag;
        });

        // Write back
        for (const teamName in standings) {
          const s = standings[teamName];

          await fetch(
            `https://notsopro-backend.onrender.com/api/teams/${s.id}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                Wins: s.Wins,
                Losses: s.Losses,
                For: s.For,
                Ag: s.Ag,
                Diff: s.Diff
              })
            }
          );
        }

        // Mark division as complete
        setDivisionChecks(prev =>
          prev.map(d =>
            d.name === division
              ? { ...d, status: "done" }
              : d
          )
        );
      }

      setRecalcStatus("All divisions updated successfully!");
      setTimeout(() => setIsRecalculating(false), 2500);

    } catch (err) {
      console.error(err);
      setRecalcStatus("Error recalculating standings.");
      setTimeout(() => setIsRecalculating(false), 2500);
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

      {/* Recalculate Standings Section */}
      <div style={{ marginTop: 40 }}>
        <h2 style={{ marginBottom: 10 }}>Recalculate Standings</h2>

        <label style={{ fontSize: 14 }}>Select Division:</label>
        <select
          style={{
            width: "100%",
            padding: 12,
            marginTop: 8,
            marginBottom: 20,
            fontSize: 16,
            borderRadius: 8,
          }}
          value={selectedDivision}
          onChange={(e) => setSelectedDivision(e.target.value)}
        >
          <option value="">-- Choose Division --</option>
          {divisionList.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
          <option value="ALL">All Divisions</option>
        </select>

        <button
          style={{ ...styles.button, backgroundColor: "#28a745" }}
          onClick={handleRunRecalculate}
        >
          Run
        </button>
      </div>

      {/* Tournament Maintenance Section */}
      <div style={{ marginTop: 50 }}>
        <h2 style={{ marginBottom: 10 }}>Tournament Maintenance</h2>

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

      {/* Reset Overlay */}
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

      {/* Recalculate Overlay */}
      {isRecalculating && (
        <div style={overlayStyles.backdrop}>
          <div style={overlayStyles.panel}>
            <h2>Recalculating Standings…</h2>
            <p>{recalcStatus}</p>

            <div style={{ marginTop: 20, textAlign: "left" }}>
              {divisionChecks.map((d) => (
                <div
                  key={d.name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                    fontSize: 16,
                  }}
                >
                  <span>{d.name}</span>
                  <span>
                    {d.status === "pending" && "⏳"}
                    {d.status === "processing" && "🔄"}
                    {d.status === "done" && "✓"}
                  </span>
                </div>
              ))}
            </div>
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
