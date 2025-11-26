import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignUpListener from "./pages/SignUpListener";
import SignUpArtist from "./pages/SignUpArtist";
import LoginListener from "./pages/LoginListener";
import LoginArtist from "./pages/LoginArtist";
import DashboardListener from "./pages/DashboardListener";
import Home from "./pages/Home";
// (Dashboard artist to add later)

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup-listener" element={<SignUpListener />} />
        <Route path="/signup-artist" element={<SignUpArtist />} />
        <Route path="/login-listener" element={<LoginListener />} />
        <Route path="/login-artist" element={<LoginArtist />} />
        <Route path="/dashboard-listener" element={<DashboardListener />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
