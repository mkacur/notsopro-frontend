// src/pages/Standings.js
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
{import AdminSliver from "../components/AdminSliver";}
import StandingsTable from "../components/StandingsTable";
import { useAdmin } from "../context/AdminContext";
import "./Standings.css";
	
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

  /* ------------------------------ */
  /* FETCH DATA                     */
  /* ------------------------------ */
  useEffect(() => {
    fetch("https://notsopro-backend.onrender.com/api/divisions")
      .then((res) => res.json())
      .then((data) => setDivisions(data.value));

    fetch("https://notsopro-backend.onrender.com/api/teams")
      .then((res) => res.json())
      .then((data) => setTeams(data.value));
  }, []);

  /* ------------------------------ */
  /* STICKY HEADER SHADOW ON SCROLL */
  /* ------------------------------ */
  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector(".standings__header");
      if (!header) return;

      if (window.scrollY > 10) {
        header.classList.add("standings__header--sticky");
      } else {
        header.classList.remove("standings__header--sticky");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ------------------------------ */
  /* SORTING + FILTERING            */
  /* ------------------------------ */

  // Alphabetical list for dropdowns
  const alphaTeams = [...teams].sort((a, b) =>
    a.fields.TeamName.localeCompare(b.fields.TeamName)
  );

  // Teams in selected division
  const filteredTeams = teams.filter(
    (t) => t.fields.Division === division
  );

  // Standings-sorted list for the table
  const standingsTeams = [...filteredTeams].sort((a, b) => {
    const A = a.fields;
    const B = b.fields;

    if (A.Wins !== B.Wins) return B.Wins - A.Wins;
    if (A.Losses !== B.Losses) return A.Losses - B.Losses;
    return (B.Diff || 0) - (A.Diff || 0);
  });

  // Division colors
  const divRecord = divisions.find((d) => d.fields.Division === division);
  const fillColor = divRecord?.fields.DivFillColor || "#ffffff";
  const fontColor = divRecord?.fields.DivFontColor || "#000000";

  /* ------------------------------ */
  /* RENDER                         */
  /* ------------------------------ */
  return (
    <div className="standings__container">

      {/* ⭐ STICKY HEADER (title + dropdown rows) */}
      <div className="standings__header">

        {/* Row 1: Title + Print Button */}
        <div className="standings__header-top">
          <h1 className="standings__title">Not So Pro Standings</h1>

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

        {/* Row 2: Division + Home */}
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

        {/* Row 3: Team + Schedule */}
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
            {alphaTeams
              .filter((t) => t.fields.Division === division)
              .map((t) => (
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
      </div>

      {/* ⭐ Division label (hidden on screen, visible in print) */}
      {division && (
        <h2 className="standings__division-title">
          Division: {division}
        </h2>
      )}

      {/* Standings Table */}
      {division && (
        <div className="standings__table-wrapper">
          <StandingsTable
            teams={standingsTeams}
            fillColor={fillColor}
            fontColor={fontColor}
          />
        </div>
      )}

      {/* <AdminSliver />  Removed from Standings page to avoid overlap */}

      <footer className="standings__print-footer print-only">
        Printed for {division} on{" "}
        {new Date().toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </footer>
    </div>
  );
