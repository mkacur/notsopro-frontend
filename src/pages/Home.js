import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../NSPLogo.png";
import "./Home.css";

function Home() {
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

  return (
    <div
      className="home"
      style={{
        backgroundImage: "url('/backgrounddark.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      <div className="home__container">
        <header className="home__header">
          <h1 className="home__title">Not So Pro Tournament</h1>

          <img
            src={logo}
            alt="Not So Pro Logo"
            className="home__logo"
          />

          <h2 className="home__subtitle">Welcome to the new app</h2>

          {/* Controls */}
          <div className="home__controls">

            {/* Row 1 */}
            <div className="home__controls-row">
              <select
                value={division}
                onChange={(e) => {
                  setDivision(e.target.value);
                  setTeam("");
                }}
                className="home__dropdown"
              >
                <option value="">Select Division</option>
                {divisions.map((d) => (
                  <option key={d.id} value={d.fields.Division}>
                    {d.fields.Division}
                  </option>
                ))}
              </select>

              <button
                className="home__button"
                onClick={() =>
                  navigate(`/schedule?division=${division}&team=${team}`)
                }
              >
                Schedule
              </button>
            </div>

            {/* Row 2 */}
            <div className="home__controls-row">
              <select
                value={team}
                onChange={(e) => {
                  const selectedTeam = e.target.value;
                  setTeam(selectedTeam);
                  if (selectedTeam) {
                    navigate(`/schedule?division=${division}&team=${selectedTeam}`);
                  }
                }}
                className="home__dropdown"
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
                className="home__button"
                onClick={() =>
                  navigate(`/standings?division=${division}&team=${team}`)
                }
              >
                Standings
              </button>
            </div>
          </div>

          {/* QR */}
          <div className="home__qr">
            <p className="home__qr-caption">Share App</p>
            <img src="/NotSoProQR.png" alt="QR Code" className="home__qr-image" />
          </div>

          <div className="home__install-help">
            <p className="home__install-text">
             Android users: If you want to save the app icon, long‑press this link and choose "Open in          Chrome":
           </p>
          <a href="https://notsopro-frontend.onrender.com" className="home__install-link">
          https://notsopro-frontend.onrender.com
         </a>
        </div>

          {/* DJ */}
          <div className="home__dj">
            <img src="/DJMike.png" alt="DJ Mike" className="home__dj-image" />
          </div>

          {/* Sponsors */}
          <div className="home__sponsors">
            <img src="/Sunbum.png" alt="Sunbum" className="home__sponsor-logo home__sponsor-logo--sunbum" />
            <img src="/RedRain.png" alt="Red Rain" className="home__sponsor-logo home__sponsor-logo--redrain" />
            <img src="/PitaPit.png" alt="Pita Pit" className="home__sponsor-logo home__sponsor-logo--pitapit" />
            <img src="/TwistedTea.png" alt="Twisted Tea" className="home__sponsor-logo home__sponsor-logo--twistedtea" />
          </div>
        </header>
      </div>
    </div>
  );
}

export default Home;
