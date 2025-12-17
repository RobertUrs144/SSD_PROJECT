import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth, db } from "./firebase"; 
import { onAuthStateChanged } from "firebase/auth"; 
import { doc, getDoc } from "firebase/firestore"; 

// Import Pages
import Home from './pages/Home';
import SignupListener from './pages/SignUpListener';
import SignupArtist from './pages/SignUpArtist';
import LoginListener from './pages/LoginListener';
import LoginArtist from './pages/LoginArtist';
import ListenerDashboard from './pages/ListenerDashboard';
import ArtistDashboard from './pages/ArtistDashboard';
import EditListenerProfile from './pages/EditListenerProfile';
import EditArtistProfile from './pages/EditArtistProfile';
import ArtistAnalytics from './pages/ArtistAnalytics'; // <--- NEW IMPORT

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- 1. AUTH STATE LISTENER ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setRole(docSnap.data().role);
        } else {
          setRole(null); 
        }
        setUser(currentUser);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe(); 
  }, []);

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', color: 'white' }}>
      Authenticating...
    </div>;
  }

  // --- 2. AUTHENTICATED REDIRECTION LOGIC ---
  if (user && role) {
    
    // LISTENER ROUTES
    if (role === 'listener') {
      return (
        <Router>
          <Routes>
            {/* Listener routes that only a listener can see */}
            <Route path="/dashboard-listener" element={<ListenerDashboard />} />
            <Route path="/edit-listener-profile" element={<EditListenerProfile />} />
            
            {/* Redirect all other paths, including root ('/'), to the dashboard */}
            <Route path="*" element={<Navigate to="/dashboard-listener" replace />} /> 
          </Routes>
        </Router>
      );
    }
    
    // ARTIST ROUTES
    if (role === 'artist') {
      return (
        <Router>
          <Routes>
            {/* Artist routes that only an artist can see */}
            <Route path="/dashboard-artist" element={<ArtistDashboard />} />
            <Route path="/edit-artist-profile" element={<EditArtistProfile />} />
            <Route path="/analytics-artist" element={<ArtistAnalytics />} /> {/* <--- NEW ROUTE */}
            
            {/* Redirect all other paths, including root ('/'), to the dashboard */}
            <Route path="*" element={<Navigate to="/dashboard-artist" replace />} /> 
          </Routes>
        </Router>
      );
    }
  }

  // --- 3. PUBLIC ROUTES (If user is NOT logged in) ---
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/signup-listener" element={<SignupListener />} />
        <Route path="/signup-artist" element={<SignupArtist />} />
        <Route path="/login-listener" element={<LoginListener />} />
        <Route path="/login-artist" element={<LoginArtist />} />

        {/* Protect Dashboard Routes (Redirects non-logged-in users back to login) */}
        <Route path="/dashboard-listener" element={<Navigate to="/login-listener" replace />} />
        <Route path="/dashboard-artist" element={<Navigate to="/login-artist" replace />} />
        <Route path="/edit-listener-profile" element={<Navigate to="/login-listener" replace />} />
        <Route path="/edit-artist-profile" element={<Navigate to="/login-artist" replace />} />
        <Route path="/analytics-artist" element={<Navigate to="/login-artist" replace />} /> {/* <--- PROTECTED */}
        
        {/* Handle 404/Unknown routes by redirecting to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;