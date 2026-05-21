import React from "react";

export default function StandingsTable({ teams, fillColor = "#fff", fontColor = "#000" }) {
  // Read selected team from URL
  const params = new URLSearchParams(window.location.search);
  const selectedTeam = params.get("team") || "";

  return (
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
        {teams.map((t, index) => {
          const diff = t.fields.Diff || 0;
          const diffColor = diff < 0 ? "#ff3b30" : "#000";

          const isSelected = selectedTeam === t.fields.TeamName;

          return (
            <tr
              key={t.id}
              style={{
                backgroundColor: isSelected ? "rgba(220,220,220,0.45)" : "transparent",
                fontWeight: isSelected ? "bold" : "normal",
              }}
            >
              <td style={styles.td}>{index + 1}</td>

              {/* Team Name cell keeps division color */}
              <td
                style={{
                  ...styles.td,
                  background: fillColor,
                  color: fontColor,
                  textAlign: "left",
                  paddingLeft: 8,
                  fontWeight: isSelected ? "bold" : "normal",
                }}
              >
                {t.fields.TeamName}
              </td>

              {/* Other cells get grey highlight via row background */}
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
  );
}

const styles = {
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
    borderBottom: "1px solid #ccc",
  },
  td: {
    padding: "4px 4px",
    textAlign: "center",
    borderBottom: "1px solid #ddd",
  },
};
