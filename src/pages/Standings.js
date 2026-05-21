// src/pages/Standings.js
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AdminSliver from "../components/AdminSliver";
import StandingsTable from "../components/StandingsTable";
import { useAdmin } from "../context/AdminContext";
	

export default function Standings() {
  const { adminMode } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const initialDivision = params.get("division") || "";
  const initialTeam = params.get("team") || "";

  const [divisions, setDivisions] = useState([]);
  const [teams, setTeams] = useState([]);

  const [division, setDivision] = useState(initialDivision);
  const [team, setTeam] = useState(initialTeam);

  // -----------------------------
  // LOAD DATA
  // -----------------------------
  useEffect(() => {
    fetch("https://notsopro-backend.onrender.com/api/divisions")
      .then((res) => res.json())
      .then((data) => setDivisions(data.value));

    fetch("https://notsopro-backend.onrender.com/api/teams")
      .then((res) => res.json())
      .then((data) => setTeams(data.value));
  }, []);

  // -----------------------------
  // DIVISION COLORS
  // -----------------------------
  const divRecord = divisions.find((d) => d.fields.Division === division);
  const fillColor = divRecord?.fields.DivFillColor || "#ffffff";
  const fontColor = divRecord?.fields.DivFontColor || "#000000";

  // -----------------------------
  // FILTER + SORT TEAMS
  // -----------------------------
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

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: 20, paddingBottom: 60 }}>
      
      {/* Title + Print Button */}
      <div style={styles.titleRow}>
        <div>
          <h1 style={styles.title}>Not So Pro Standings</h1>
          {division && (
            <h2 style={styles.divisionTitle}>Division: {division}</h2>
          )}
        </div>

        {division && (
          <button
            style={styles.printIcon}
            onClick={() => window.print()}
            title="Print standings"
          >
            🖨️
          </button>
        )}
      </div>

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

      {/* Row 2: Team + Schedule */}
      <div style={styles.row}>
        <select
          value={team}
          onChange={(e) => {
           const newTeam = e.target.value;
            setTeam(newTeam);

            // Update the URL so highlighting works immediately
             const params = new URLSearchParams(location.search);
             params.set("division", division);
             params.set("team", newTeam);
          navigate(`/standings?${params.toString()}`, { replace: true });
          }}
          style={styles.dropdown}
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
          className="nav-btn"
          style={{ flex: 3 }}
          onClick={() =>
            navigate(`/schedule?division=${division}&team=${team}`)
          }
        >
          Schedule
        </button>
      </div>

      {/* Standings Table */}
      {division && (
        <div className="standings-table" style={styles.tableWrapper}>
          <StandingsTable
            teams={sortedTeams}
            fillColor={fillColor}
            fontColor={fontColor}
          />
        </div>
      )}

      <AdminSliver />	
	
      <footer className="print-only">     
       Printed for {division} on{" "}
        {new Date().toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
         })}
      </footer>
    </div>
  );
}

const styles = {
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
  tableWrapper: {
    overflowX: "auto",
  },
  titleRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    margin: 0,
    padding: 0,
  },
  printIcon: {
    fontSize: 20,
    padding: 6,
    borderRadius: 6,
    border: "1px solid #ccc",
    background: "#f5f5f5",
    cursor: "pointer",
  },
};
		