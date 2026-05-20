import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Standings() {
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const initialDivision = params.get("division") || "";
  const initialTeam = params.get("team") || "";

  const [divisions, setDivisions] = useState([]);
  const [teams, setTeams] = useState([]);

  const [division, setDivision] = useState(initialDivision);
  const [team, setTeam] = useState(initialTeam);

  const normalize = (s) =>
    s?.replace(/['’]/g, "").replace(/\s+/g, " ").trim().toLowerCase();

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
    <div style={{ maxWidth: 420, margin: "0 auto", padding: 20 }}>
      <h1 style={{ textAlign: "center", marginBottom: 10 }}>
       Not So Pro - Standings </h1>


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
          onChange={(e) => setTeam(e.target.value)}
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
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={{ ...styles.th, textAlign: "left", paddingLeft: 8 }}>Team</th>
                <th style={styles.th}>W</th>
                <th style={styles.th}>L</th>
                <th style={styles.th}>For</th>
                <th style={styles.th}>Ag</th>
                <th style={styles.th}>Diff</th>
              </tr>
            </thead>

            <tbody>
              {sortedTeams.map((t, index) => {
                const isSelected =
                  normalize(t.fields.TeamName) === normalize(team);
                const diff = t.fields.Diff || 0;
                const diffColor = diff < 0 ? "#ff3b30" : "#000";

                return (
                  <tr
                    key={t.id}
                    style={{
                      fontWeight: isSelected ? "bold" : "normal",
                    }}
                  >
                    <td style={styles.td}>{index + 1}</td>

                    <td
                      style={{
                        ...styles.td,
                        background: fillColor,
                        color: fontColor,
                        textAlign: "left",
                        paddingLeft: 8,
                      }}
                    >
                      {t.fields.TeamName}
                    </td>

                    <td style={styles.td}>{t.fields.Wins}</td>
                    <td style={styles.td}>{t.fields.Losses}</td>
                    <td style={styles.td}>{t.fields.For}</td>
                    <td style={styles.td}>{t.fields.Ag}</td>
                    <td style={{ ...styles.td, color: diffColor }}>{diff}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
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
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 14,
  },
  th: {
    padding: "6px 4px",
    background: "#fff",
    fontWeight: 700,
    textAlign: "center",
  },
  td: {
    padding: "4px 4px",
    textAlign: "center",
    borderBottom: "1px solid #ddd",
  },
};
