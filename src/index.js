import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AdminProvider } from "./context/AdminContext";   // ⭐ ADD THIS

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AdminProvider>      {/* ⭐ WRAP APP HERE */}
      <App />
    </AdminProvider>
  </React.StrictMode>
);

reportWebVitals();

