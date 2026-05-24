// src/components/AdminSliver.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";

export default function AdminSliver({ className = "" }) {
  const { adminMode, enterAdminMode, exitAdminMode, checkingPin, error } = useAdmin();
  const [showPanel, setShowPanel] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const navigate = useNavigate();	

  const handleEnterClick = async () => {
    const success = await enterAdminMode(pinInput);
    if (success) {
      setShowPanel(false);
      setPinInput("");
    }
  };

  const handleExitClick = () => {
    exitAdminMode();
    setShowPanel(false);
    setPinInput("");
  };

  const handleAdminPanelClick = () => navigate("/admin");

  // Shared compact styles
  const buttonStyle = {
    fontSize: "11px",
    padding: "3px 6px",
    minWidth: "60px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    backgroundColor: "#fff",
    cursor: "pointer",
    whiteSpace: "nowrap",
  };

  const inputStyle = {
    width: "45px",
    fontSize: "11px",
    padding: "3px",
    textAlign: "center",
    borderRadius: "6px",
    border: "1px solid #ccc",
    whiteSpace: "nowrap",
  };

  // Flex container for one-line layout
  const containerStyle = {
    position: "fixed",
    bottom: 0,
    left: 0,
    width: "100%",
    backgroundColor: "#f5f5f5",
    borderTop: "1px solid #ddd",
    padding: "6px 8px",
    zIndex: 9999,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "6px",
    flexWrap: "nowrap",
    overflowX: "auto",
  };

  // Subtle color logic
  const labelStyle = {
    fontSize: "11px",
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
    color: adminMode
      ? "#4caf50" // green tint when active
      : showPanel
      ? "#666"    // neutral grey when waiting for PIN
      : "#bbb",   // faint grey when inactive
  };

  return (
    <div className={`admin-sliver ${className}`} style={containerStyle}>
      <span style={labelStyle} onClick={() => setShowPanel((prev) => !prev)}>
        Admin Mode: {adminMode ? "true" : "false"}
      </span>

      {adminMode ? (
        <>
          <button style={buttonStyle} onClick={handleAdminPanelClick}>
            Admin Panel
          </button>
          <button style={buttonStyle} onClick={handleExitClick}>
            Exit Adm
          </button>
        </>
      ) : (
        showPanel && (
          <>
            <input
              
              placeholder="PIN"
              value={pinInput}
              autoComplete="one-time-code"
              onChange={(e) => setPinInput(e.target.value)}
              style={inputStyle}
            />
            <button
              onClick={handleEnterClick}
              disabled={checkingPin}
              style={buttonStyle}
            >
              {checkingPin ? "..." : "Enter Adm"}
            </button>
            <button onClick={handleExitClick} style={buttonStyle}>
              Exit Adm
            </button>
            {error && (
              <span style={{ color: "red", fontSize: "11px", whiteSpace: "nowrap" }}>
                {error}
              </span>
            )}
          </>
        )
      )}
    </div>
  );
}
	