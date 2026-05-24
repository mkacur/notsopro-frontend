import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function EnterScore() {
  const navigate = useNavigate();
  const location = useLocation();

  // Primary source: router state
  const stateGame = location.state?.game || null;
  const stateTeams = location.state?.teams || [];
  const stateDivision = location.state?.division || "";
  const stateTeam = location.state?.team || "";

  // URL params
  const params = new URLSearchParams(location.search);
  const fallbackGameId = params.get("gameId");
  const fallbackTeam = params.get("team");
  const fallbackDivision = params.get("division");

  // Game + teams
  const [game, setGame] = useState(stateGame);
  const [teams, setTeams] = useState(stateTeams);

  // Division + team (URL first, then router state)
  const [division, setDivision] = useState(
    fallbackDivision || stateDivision || ""
  );	

  const [team] = useState(fallbackTeam || stateTeam || "");

  // Scores
  const [scoreA, setScoreA] = useState("");
  const [scoreB, setScoreB] = useState("");

  // Captain Code
  const [code, setCode] = useState("");

  const handleCodeChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    setCode(raw);
  };

  // Admin + UI state
  const [adminPin, setAdminPin] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Load Admin PIN
  useEffect(() => {
    fetch("https://notsopro-backend.onrender.com/api/admin")
      .then((res) => res.json())
      .then((data) => {
        const active = data.value.find((a) => a.fields.Active === "Yes");
        setAdminPin(active?.fields.PIN || "");
      })
      .catch(() => setAdminPin(""));
  }, []);

  // Fallback loader (only runs if no router state)
  useEffect(() => {
    if (game) return; // already have game from state
    if (!fallbackGameId) return;

    fetch("https://notsopro-backend.onrender.com/api/games")
      .then((res) => res.json())
      .then((data) => {
        const found = data.value.find((g) => g.id === fallbackGameId);
        if (found) {
          setGame(found);
          setDivision(found.fields.Division);
        }
      });

    if (teams.length === 0) {
      fetch("https://notsopro-backend.onrender.com/api/teams")
        .then((res) => res.json())
        .then((data) => setTeams(data.value));
    }
  }, [fallbackGameId, game, teams.length]);



  // Fix: prevent flash of "No game selected"
  if (!game && !fallbackGameId) {
    return <div style={{ padding: 20 }}>No game selected.</div>;
  }

  if (!game && fallbackGameId) {
    return <div style={{ padding: 20 }}>Loading game...</div>;
  }

  const teamA = game.fields.TeamA;
  const teamB = game.fields.TeamB;

  const normalizeCode = (c) =>
    c?.toString().trim().replace(/\s+/g, "").toLowerCase();

  // Look up captain codes
  const teamARecord = teams.find((t) => t.fields.TeamName === teamA);
  const teamBRecord = teams.find((t) => t.fields.TeamName === teamB);

  const captainCodeA = teamARecord?.fields.CaptainCode;
  const captainCodeB = teamBRecord?.fields.CaptainCode;

  const validCodes = [captainCodeA, captainCodeB, adminPin]
    .filter(Boolean)
    .map(normalizeCode);

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);

    const a = parseInt(scoreA, 10);
    const b = parseInt(scoreB, 10);

    if (Number.isNaN(a) || Number.isNaN(b)) {
      setError("Please enter scores for both teams");
      setSubmitting(false);
      return;
    }

    if (a === b) {
      setError("Error: wrong code or no ties allowed");
      setSubmitting(false);
      return;
    }

    if (!validCodes.includes(normalizeCode(code))) {
      setError("Error: wrong code or no ties allowed");
      setSubmitting(false);
      return;
    }

    const winner = a > b ? teamA : teamB;
    const loser = a > b ? teamB : teamA;

    try {
      // Update GAME
      await fetch(
        `https://notsopro-backend.onrender.com/api/games/${game.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ScoreA: a,
            ScoreB: b,
            Winner: winner,
            Loser: loser,
            Status: "Final",
          }),
        }
      );

      // Update TEAMS
      const updateTeam = async (teamName, won, forPts, agPts) => {
        const teamRec = teams.find(
          (t) => t.fields.TeamName === teamName
        );
        if (!teamRec) return;

        await fetch(
          `https://notsopro-backend.onrender.com/api/teams/${teamRec.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              Wins: (teamRec.fields.Wins || 0) + (won ? 1 : 0),
              Losses: (teamRec.fields.Losses || 0) + (won ? 0 : 1),
              For: (teamRec.fields.For || 0) + forPts,
              Ag: (teamRec.fields.Ag || 0) + agPts,
              Diff:
                (teamRec.fields.For || 0) +
                forPts -
                ((teamRec.fields.Ag || 0) + agPts),
            }),
          }
        );
      };

      await updateTeam(teamA, a > b, a, b);
      await updateTeam(teamB, b > a, b, a);

      setSuccess(true);

      // Redirect back to SAME schedule view
      setTimeout(() => {
        navigate(`/schedule?division=${division}&team=${team}`);
      }, 1500);
    } catch (err) {
      setError("Submission failed. Try again.");
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Not So Pro – Enter Score</h2>

      <div style={styles.gameHeader}>
        <span style={styles.teamName}>{teamA}</span>
        <span style={styles.vs}>vs</span>
        <span style={styles.teamName}>{teamB}</span>
      </div>

      <div style={styles.metaBox}>
        <div>{game.fields.GameDate}</div>
        <div>{game.fields.GameTimeTx}</div>
        <div>Match {game.fields.Match}</div>
        <div>Court {game.fields.Court}</div>
      </div>

      <div style={styles.scoreBox}>
        <div style={styles.scoreRow}>
          <span style={styles.teamLabel}>{teamA}</span>
          <input
            name="scoreA"
            autoComplete="one-time-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={scoreA}
            onChange={(e) => setScoreA(e.target.value)}
           style={styles.scoreInput}
         />
        </div>

        <div style={styles.scoreRow}>
          <span style={styles.teamLabel}>{teamB}</span>
          <input
            name="scoreB"
            autoComplete="one-time-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={scoreB}
            onChange={(e) => setScoreB(e.target.value)}
            style={styles.scoreInput}
          />
        </div>
      </div>

      <input
        name="captainCode"
        type="password"
        placeholder="Captain Code"
        value={code}
        onChange={handleCodeChange}
        autoComplete="one-time-code"
        inputMode="numeric"
        pattern="[0-9]*"
        autoCorrect="off"
        spellCheck="false"
        style={styles.codeInput}
      />

      {error && <div style={styles.errorBanner}>{error}</div>}
      {success && <div style={styles.successBanner}>Score submitted!</div>}

      <button
        style={styles.submitBtn}
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting ? <div className="spinner" /> : "Submit Score"}
      </button>

      <button
        style={styles.cancelBtn}
        onClick={() =>
          navigate(`/schedule?division=${division}&team=${team}`)
        }
      >
        Cancel
      </button>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 420,
    margin: "0 auto",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  title: {
    textAlign: "center",
    marginBottom: 5,
  },
  gameHeader: {
    display: "flex",
    justifyContent: "center",
    gap: 10,
    fontSize: 22,
  },
  teamName: {
    fontSize: 22,
    fontWeight: 600,
  },
  vs: {
    fontSize: 20,
    opacity: 0.7,
  },
  metaBox: {
    background: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    display: "flex",
    justifyContent: "space-around",
    fontSize: 14,
  },
  scoreBox: {
    background: "#fafafa",
    padding: 15,
    borderRadius: 10,
  },
  scoreRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  teamLabel: {
    fontSize: 18,
  },
  scoreInput: {
    width: 80,
    padding: 10,
    fontSize: 20,
    textAlign: "center",
    borderRadius: 8,
    border: "1px solid #ccc",
  },
  codeInput: {
    padding: 12,
    fontSize: 18,
    borderRadius: 8,
    border: "1px solid #ccc",
  },
  submitBtn: {
    width: "100%",
    padding: 16,
    fontSize: 20,
    background: "#0078ff",
    color: "white",
    border: "none",
    borderRadius: 10,
    fontWeight: 700,
  },
  cancelBtn: {
    width: "100%",
    padding: 14,
    fontSize: 18,
    background: "#ddd",
    border: "none",
    borderRadius: 10,
    fontWeight: 600,
  },
  errorBanner: {
    background: "#ffdddd",
    color: "#b00020",
    padding: 12,
    borderRadius: 8,
    textAlign: "center",
    fontWeight: 600,
  },
  successBanner: {
    background: "#e6ffe6",
    color: "#007700",
    padding: 12,
    borderRadius: 8,
    textAlign: "center",
    fontWeight: 600,
  },
};

const spinnerStyle = `
  .spinner {
    width: 20px;
    height: 20px;
    border: 3px solid white;
    border-top: 3px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

if (typeof document !== "undefined") {
  const styleTag = document.createElement("style");
  styleTag.innerHTML = spinnerStyle;
  document.head.appendChild(styleTag);
}
