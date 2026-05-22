import React from "react";
import "./StandingsTable.css";

export default function StandingsTable({ teams, fillColor = "#fff", fontColor = "#000" }) {
  const params = new URLSearchParams(window.location.search);
  const selectedTeam = params.get("team") || "";

  return (
    <table className="standings-table">
      <thead>
        <tr>
          <th className="standings-table__header-cell">#</th>
          <th className="standings-table__header-cell standings-table__header-cell--team">Team</th>
          <th className="standings-table__header-cell">W</th>
          <th className="standings-table__header-cell">L</th>
          <th className="standings-table__header-cell">For</th>
          <th className="standings-table__header-cell">Ag</th>
          <th className="standings-table__header-cell">Diff</th>
        </tr>
      </thead>

      <tbody>
        {teams.map((t, index) => {
          const diff = t.fields.Diff || 0;
          const isSelected = selectedTeam === t.fields.TeamName;

          return (
            <tr
              key={t.id}
              className={`standings-table__row ${
                isSelected ? "standings-table__row--selected" : ""
              }`}
            >
              <td className="standings-table__cell">{index + 1}</td>

              <td
                className="standings-table__cell standings-table__cell--division"
                style={{
                  background: fillColor,
                  color: fontColor,
                }}
              >
                {t.fields.TeamName}
              </td>

              <td className="standings-table__cell">{t.fields.Wins}</td>
              <td className="standings-table__cell">{t.fields.Losses}</td>
              <td className="standings-table__cell">{t.fields.For}</td>
              <td className="standings-table__cell">{t.fields.Ag}</td>

              <td
                className={`standings-table__cell standings-table__cell--diff ${
                  diff < 0 ? "negative" : ""
                    }`}
                   >
               {diff}
              </td>

            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
