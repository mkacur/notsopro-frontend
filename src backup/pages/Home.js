import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../NSPLogo.png";
import "../App.css";

function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  // Read division/team from URL
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

  return (
    <div
      className="App"
      style={{
        backgroundImage: "url('/backgrounddark.png')",
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      <div className="home-container">
        <header className="App-header">
          <h1 className="title-text">Not So Pro Tournament</h1>
          <img
            src={logo}
            alt="Not So Pro Logo"
            style={{ width: "200px", marginBottom: "10px" }}
          />
          <h2 className="subtitle-text">Welcome to the new app</h2>

          {/* 70/30 layout */}
          <div className="dropdown-stack">

            {/* Row 1: Division + Schedule */}
            <div className="row">
              <select
                value={division}
                onChange={(e) => {
                  setDivision(e.target.value);
                  setTeam("");
                }}
                className="dropdown"
                style={{ flex: 7 }}
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
                  navigate(`/schedule?division=${division}&team=${team}`)
                }
              >
                Schedule
              </button>
            </div>

            {/* Row 2: Team + Standings */}
            <div className="row">
              <select
                value={team}
                onChange={(e) => {
                  const selectedTeam = e.target.value;
                  setTeam(selectedTeam);

                  // Auto-jump to Schedule
                  if (selectedTeam) {
                    navigate(`/schedule?division=${division}&team=${selectedTeam}`);
                  }
                }}
                className="dropdown"
                style={{ flex: 7 }}
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

          {/* QR + Sponsors */}
          <div className="qr-section">
            <p className="qr-caption">Share App</p>
            <img src="/NotSoProQR.png" alt="QR Code" className="qr-image" />
          </div>

          <div className="dj-section">
            <img src="/DJMike.png" alt="DJ Mike" className="dj-image" />
          </div>

          <div className="sponsor-section">
            <img src="/Sunbum.png" alt="Sunbum" className="sponsor-logo sunbum" />
            <img src="/RedRain.png" alt="Red Rain" className="sponsor-logo redrain" />
            <img src="/PitaPit.png" alt="Pita Pit" className="sponsor-logo pitapit" />
            <img src="/TwistedTea.png" alt="Twisted Tea" className="sponsor-logo twistedtea" />
          </div>
        </header>
      </div>
    </div>
  );
}

export default Home;

