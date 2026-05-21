
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AdminProvider } from "./context/AdminContext";

import Home from "./pages/Home";
import AdminPage from "./pages/AdminPage";
import Schedule from "./pages/Schedule";
import EnterScore from "./pages/EnterScore";
import Standings from "./pages/Standings";


function App() {
  return (
    <AdminProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/enter-score" element={<EnterScore />} />
          <Route path="/standings" element={<Standings />} />
          
        </Routes>
      </Router>
    </AdminProvider>
  );
}

export default App;
