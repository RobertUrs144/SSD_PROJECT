import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import ListenerDashboard from './pages/ListenerDashboard';  // <-- Add this import
import SignupListener from './pages/SignUpListener';
import LoginListener from './pages/LoginListener';
import DashboardListener from './pages/DashboardListener';
import EditListenerProfile from './pages/EditListenerProfile';
import SignupArtist from './pages/SignUpArtist';
import LoginArtist from './pages/LoginArtist';
import ArtistDashboard from './pages/ArtistDashboard';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup-listener" element={<SignupListener />} />
        <Route path="/login-listener" element={<LoginListener />} />
        <Route path="/dashboard-listener" element={<DashboardListener />} />
        <Route path="/edit-listener-profile" element={<EditListenerProfile />} />
        <Route path="/signup-artist" element={<SignupArtist />} />
        <Route path="/login-artist" element={<LoginArtist />} />
        <Route path="/dashboard-artist" element={<ArtistDashboard />} />
        <Route path="/listener-dashboard" element={<ListenerDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
