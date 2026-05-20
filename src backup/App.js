import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Schedule from "./pages/Schedule";
import EnterScore from "./pages/EnterScore";
import Standings from "./pages/Standings";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/schedule" element={<Schedule />} />
	<Route path="/enter-score" element={<EnterScore />} />
        <Route path="/standings" element={<Standings />} />	
      </Routes>
    </Router>
  );
}

export default App;

