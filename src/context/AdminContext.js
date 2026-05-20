// src/context/AdminContext.js
import React, { createContext, useContext, useState } from "react";

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [adminMode, setAdminMode] = useState(false);
  const [checkingPin, setCheckingPin] = useState(false);
  const [error, setError] = useState("");

  const enterAdminMode = async (enteredPin) => {
    setError("");
    if (!enteredPin) {
      setError("Please enter a PIN.");
      return false;
    }

    try {
      setCheckingPin(true);
      const res = await fetch("https://notsopro-backend.onrender.com/api/admin");
      const data = await res.json();

      const active = data.value.find(
        (a) => a.fields.Active === "Yes"
      );
      const activePin = active?.fields.PIN || "";

      if (enteredPin === activePin) {
        setAdminMode(true);
        setError("");
        return true;
      } else {
        setAdminMode(false);
        setError("Invalid PIN.");
        return false;
      }
    } catch (e) {
      console.error("Error validating admin PIN:", e);
      setError("Unable to validate PIN right now.");
      setAdminMode(false);
      return false;
    } finally {
      setCheckingPin(false);
    }
  };

  const exitAdminMode = () => {
    setAdminMode(false);
    setError("");
  };

  return (
    <AdminContext.Provider
      value={{
        adminMode,
        enterAdminMode,
        exitAdminMode,
        checkingPin,
        error,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
