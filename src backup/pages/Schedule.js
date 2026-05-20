import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Schedule() {
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const initialDivision = params.get("division") || "";
  const initialTeam = params.get("team") || "";

  const [divisions, setDivisions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [games, setGames] = useState([]);

  const [division, setDivision] = useState(initialDivision);
  const [team, setTeam] = useState(initialTeam);
  const [scrolled, setScrolled] = useState(false);


  const normalize = (s) =>
    s?.replace(/['’]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

  useEffect(() => {
    fetch("https://notsopro-backend.onrender.com/api/divisions")
      .then((res) => res.json())
      .then((data) => setDivisions(data.value));

    fetch("https://notsopro-backend.onrender.com/api/teams")
      .then((res) => res.json())
      .then((data) => setTeams(data.value));

    fetch("https://notsopro-backend.onrender.com/api/games")
      .then((res) => res.json())
      .then((data) => {
        console.log("ONE GAME:", data.value[0]?.fields);
        setGames(data.value);
      });
  }, []);

   useEffect(() => {
   const handleScroll = () => {
    setScrolled(window.scrollY > 10);
  	};

  	window.addEventListener("scroll", handleScroll);
  	return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  const filteredGames = games.filter((g) => {
    if (!division) return false;

    const gameDiv = normalize(g.fields.Division);
    const selectedDiv = normalize(division);

    if (team) {
      return (
        gameDiv === selectedDiv &&
        (g.fields.TeamA === team || g.fields.TeamB === team)
      );
    }

    return gameDiv === selectedDiv;
  });


  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: 20 }}>
      {/* 🔥 Sticky Header Wrapper */}
      <div
  	style={{
    	...styles.stickyHeader,
    	boxShadow: scrolled ? "0 4px 10px rgba(0,0,0,0.25)" : "none",
  	}}
	>

  	<h1 style={{ textAlign: "center", marginBottom: 10 }}>
    	  Not So Pro - Schedule
  	</h1>
      
        {/* Row 1: Division + Home */}
        <div style={styles.row}>
          <select
            value={division}
            onChange={(e) => {
              setDivision(e.target.value);
              setTeam("");
            }}
            style={styles.dropdown}
          >
            <option value="">Select Division</option>
            {divisions.map((d) => (
              <option key={d.id} value={d.fields.Division}>
                {d.fields.Division}
              </option>
            ))}
          </select>

          <button
            className="nav-btn"
            style={{ flex: 3 }}
            onClick={() =>
              navigate(`/?division=${division}&team=${team}`)
            }
          >
            Home
          </button>
        </div>

        {/* Row 2: Team + Standings */}
        <div style={styles.row}>
          <select
            value={team}
            onChange={(e) => {
              const selectedTeam = e.target.value;
              setTeam(selectedTeam);

              if (selectedTeam) {
                navigate(`/schedule?division=${division}&team=${selectedTeam}`);
              }
            }}
            style={styles.dropdown}
            disabled={!division}
          >
            <option value="">Select Team</option>
            {teams
              .filter((t) => t.fields.Division === division)
              .map((t) => (
                <option key={t.id} value={t.fields.TeamName}>
                  {t.fields.TeamName}
                </option>
              ))}
          </select>

          <button
            className="nav-btn"
            style={{ flex: 3 }}
            onClick={() =>
              navigate(`/standings?division=${division}&team=${team}`)
            }
          >
            Standings
          </button>
        </div>
      </div>

      {/* Games */}
      {division && (
        <div>
          {filteredGames.map((g) => {
            const isFinal = g.fields.Status === "Final";
            const hasScore =
              g.fields.ScoreA !== undefined &&
              g.fields.ScoreA !== "" &&
              g.fields.ScoreB !== undefined &&
              g.fields.ScoreB !== "";

            return (
              <div key={g.id} style={styles.gameCard}>
                {/* ROW 1 — Metadata + Final */}
                <div style={styles.row1}>
                  <div style={styles.metaLeft}>
                    {g.fields.GameDate} {g.fields.GameTimeTx} &nbsp; Match{" "}
                    {g.fields.Match} &nbsp; Court {g.fields.Court}
                  </div>

                  <div style={styles.metaRight}>
                    {isFinal && (
                      <span style={{ color: "#ff8c00", fontWeight: "bold" }}>
                        Final
                      </span>
                    )}
                  </div>
                </div>

                {/* ROW 2 — Teams + Score/Pencil */}
                <div style={styles.row2}>
                  <div style={styles.teams}>
                    <span
                      style={
                        g.fields.TeamA === team ? styles.boldTeam : undefined
                      }
                    >
                      {g.fields.TeamA}
                    </span>{" "}
                    vs{" "}
                    <span
                      style={
                        g.fields.TeamB === team ? styles.boldTeam : undefined
                      }
                    >
                      {g.fields.TeamB}
                    </span>
                  </div>

                  <div style={styles.rightSide}>
                    {hasScore ? (
                      <span style={{ color: "#0078d4", fontWeight: "bold" }}>
                        {g.fields.ScoreA}–{g.fields.ScoreB}
                      </span>
                    ) : (
                      <span
                        style={{ fontSize: 20, cursor: "pointer" }}
                        onClick={() =>
                          navigate(
                            `/enter-score?gameId=${g.id}&division=${division}&team=${team}`
                          )
                        }
                      >
                        ✏️
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  stickyHeader: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "linear-gradient(white 100%, rgba(255,255,255,0))",
    backgroundColor: "white",
    paddingTop: 6,
    paddingBottom: 6,
    borderBottom: "1px solid #ddd",
    animation: "stickySlide 0.25s ease-out",
  },
  row: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },
  dropdown: {
    flex: 7,
    padding: 12,
    fontSize: 16,
    borderRadius: 8,
    border: "1px solid #ccc",
  },
  gameCard: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    border: "1px solid #ddd",
    backgroundColor: "#f9f9f9",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  row1: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  metaLeft: {
    fontSize: 14,
    color: "#000",
  },
  metaRight: {
    fontSize: 14,
  },
  row2: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  teams: {
    fontSize: 16,
    color: "#000",
  },
  boldTeam: {
    fontWeight: "bold",
  },
  rightSide: {
    minWidth: 50,
    textAlign: "right",
  },
};

// Sticky header animation
const stickyAnim = `
  @keyframes stickySlide {
    from { transform: translateY(-20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

if (typeof document !== "undefined") {
  const styleTag = document.createElement("style");
  styleTag.innerHTML = stickyAnim;
  document.head.appendChild(styleTag);
}

