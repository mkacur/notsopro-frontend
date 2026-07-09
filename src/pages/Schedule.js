import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import AdminSliver from "../components/AdminSliver";
import "./Schedule.css";

export default function Schedule() {
  const { adminMode } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const initialDivision = params.get("division") || "";
  const initialTeam = params.get("team") || "";

  const [divisions, setDivisions] = useState([]);
  const [teams, setTeams] = useState([]);
  const sortedTeams = [...teams].sort((a, b) =>
  a.fields.TeamName.localeCompare(b.fields.TeamName)
);

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
    const handleScroll = () => setScrolled(window.scrollY > 10);
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
    <div className="schedule__container">
      {/* Sticky Header */}
      <div
         className={`schedule__header ${
         scrolled ? "schedule__header--sticky" : ""
        }`}
       >

        <h1 className="schedule__title">Not So Pro - Schedule</h1>

        {/* Row 1: Division + Home */}
        <div className="schedule__row">
          <select
            value={division}
            onChange={(e) => {
              setDivision(e.target.value);
              setTeam("");
            }}
            className="schedule__dropdown"
            
          >
            <option value="">Select Division</option>
            {divisions.map((d) => (
              <option key={d.id} value={d.fields.Division}>
                {d.fields.Division}
              </option>
            ))}
          </select>

          <button
            className="schedule__button nav-btn"
            onClick={() => navigate(`/?division=${division}&team=${team}`)}
          >
            Home
          </button>
        </div>

        {/* Row 2: Team + Standings */}
        <div className="schedule__row">
          <select
            value={team}
            onChange={(e) => {
              const selectedTeam = e.target.value;
              setTeam(selectedTeam);

              if (selectedTeam) {
                navigate(`/schedule?division=${division}&team=${selectedTeam}`);
              }
            }}
            className="schedule__dropdown"
            disabled={!division}
          >
            <option value="">Select Team</option>
            {sortedTeams
              .filter((t) => t.fields.Division === division)
              .map((t) => (
              <option key={t.id} value={t.fields.TeamName}>
              {t.fields.TeamName}
              </option>
            ))}

          </select>

          <button
            className="schedule__button nav-btn"
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
        <div className="schedule__games">
          {filteredGames.map((g) => {
            const isFinal = g.fields.Status === "Final";
            const hasScore =
              g.fields.ScoreA !== "" &&
              g.fields.ScoreB !== "" &&
              g.fields.ScoreA !== undefined &&
              g.fields.ScoreB !== undefined;

           // Determine win/loss from the perspective of the selected team
let result = null; // "win" | "loss" | null
let resultLetter = ""; // "W" | "L" | ""

if (isFinal && hasScore && team) {
  const isTeamA = g.fields.TeamA === team;
  const isTeamB = g.fields.TeamB === team;

  if (isTeamA) {
    if (g.fields.ScoreA > g.fields.ScoreB) {
      result = "win";
      resultLetter = "W";
    } else {
      result = "loss";
      resultLetter = "L";
    }
  } else if (isTeamB) {
    if (g.fields.ScoreB > g.fields.ScoreA) {
      result = "win";
      resultLetter = "W";
    } else {
      result = "loss";
      resultLetter = "L";
    }
  }
}
           

            return (
              <div key={g.id} className={`schedule__game-card ${result || ""}`}>
                {/* ROW 1 — Metadata + Final */}
                <div className="schedule__meta">
                  <div className="schedule__meta-left">
                    {g.fields.GameDate} {g.fields.GameTimeTx} &nbsp; Match{" "}
                    {g.fields.Match} &nbsp; Court {g.fields.Court}
                  </div>	

         
         <div className="schedule__meta-right">
                    {isFinal && (
                      <div className="schedule__final">
                        <span style={{ color: "#ff8c00", fontWeight: "bold" }}>
                          Final
                        </span>

                        {adminMode && (
                          <span
                            className="schedule__edit-icon"
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
                    )}
                  </div>
                </div>

                {/* ROW 2 — Teams + Score/Pencil */}
                
                <div className="schedule__row--game">
                  <div className="schedule__teams">
                    <span
                      className={
                        g.fields.TeamA === team ? "schedule__team--bold" : ""
                      }
                    >
                      {g.fields.TeamA}
                    </span>{" "}
                    vs{" "}
                    <span
                      className={
                        g.fields.TeamB === team ? "schedule__team--bold" : ""
                      }
                    >
                      {g.fields.TeamB}
                    </span>
                  </div>

                  <div className="schedule__right">
                      {hasScore ? (
                      <span className="schedule__score">
                      {result && (
                      <span className={`schedule__wl schedule__wl--${result}`}>
                      {resultLetter}
                     </span>
                    )}
                  {g.fields.ScoreA}–{g.fields.ScoreB}
                </span>
                 ) : (

                      <span
                        className="schedule__edit-icon schedule__edit-icon--large"
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

      {/* <AdminSliver />  Removed from Standings page to avoid overlap */}
    </div>
  );
}

