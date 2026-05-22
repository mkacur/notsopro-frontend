// src/pages/Standings.js
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AdminSliver from "../components/AdminSliver";
import StandingsTable from "../components/StandingsTable";
import { useAdmin } from "../context/AdminContext";
import "./Standings.css";

export default function Standings() {
  useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const initialDivision = params.get("division") || "";
  const initialTeam = params.get("team") || "";

  const [divisions, setDivisions] = useState([]);
  const [teams, setTeams] = useState([]);

  const [division, setDivision] = useState(initialDivision);
  const [team, setTeam] = useState(initialTeam);

  useEffect(() => {
    fetch("https://notsopro-backend.onrender.com/api/divisions")
      .then((res) => res.json())
      .then((data) => setDivisions(data.value));

    fetch("https://notsopro-backend.onrender.com/api/teams")
      .then((res) => res.json())
      .then((data) => setTeams(data.value));
  }, []);

  const divRecord = divisions.find((d) => d.fields.Division === division);
  const fillColor = divRecord?.fields.DivFillColor || "#ffffff";
  const fontColor = divRecord?.fields.DivFontColor || "#000000";

  const filteredTeams = teams.filter(
    (t) => t.fields.Division === division
  );

  const sortedTeams = filteredTeams.sort((a, b) => {
    const A = a.fields;
    const B = b.fields;

    if (A.Wins !== B.Wins) return B.Wins - A.Wins;
    if (A.Losses !== B.Losses) return A.Losses - B.Losses;
    return (B.Diff || 0) - (A.Diff || 0);
  });

  return (
    <div className="standings__container">

      {/* Title + Print Button */}
      <div className="standings__header">
        <div>
          <h1 className="standings__title">Not So Pro Standings</h1>
          {division && (
            <h2 className="standings__division-title">
              Division: {division}
            </h2>
          )}
        </div>

        {division && (
          <button
            className="standings__print-button"
            onClick={() => window.print()}
            title="Print standings"
          >
            🖨️
          </button>
        )}
      </div>

      {/* Row 1: Division + Home */}
      <div className="standings__row">
        <select
          value={division}
          onChange={(e) => {
            setDivision(e.target.value);
            setTeam("");
          }}
          className="standings__dropdown"
        >
          <option value="">Select Division</option>
          {divisions.map((d) => (
            <option key={d.id} value={d.fields.Division}>
              {d.fields.Division}
            </option>
          ))}
        </select>

        <button
          className="standings__button nav-btn"
          onClick={() =>
            navigate(`/?division=${division}&team=${team}`)
          }
        >
          Home
        </button>
      </div>

      {/* Row 2: Team + Schedule */}
      <div className="standings__row">
        <select
          value={team}
          onChange={(e) => {
            const newTeam = e.target.value;
            setTeam(newTeam);

            const params = new URLSearchParams(location.search);
            params.set("division", division);
            params.set("team", newTeam);
            navigate(`/standings?${params.toString()}`, { replace: true });
          }}
          className="standings__dropdown"
          disabled={!division}
        >
          <option value="">Select Team (optional)</option>
          {filteredTeams.map((t) => (
            <option key={t.id} value={t.fields.TeamName}>
              {t.fields.TeamName}
            </option>
          ))}
        </select>

        <button
          className="standings__button nav-btn"
          onClick={() =>
            navigate(`/schedule?division=${division}&team=${team}`)
          }
        >
          Schedule
        </button>
      </div>

      {/* Standings Table */}
      {division && (
        <div className="standings__table-wrapper">
          <StandingsTable
            teams={sortedTeams}
            fillColor={fillColor}
            fontColor={fontColor}
          />
        </div>
      )}

      <AdminSliver />

      <footer className="standings__print-footer print-only">
        Printed for {division} on{" "}
        {new Date().toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </footer>
    </div>
  );
}
