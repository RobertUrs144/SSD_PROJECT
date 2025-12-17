import React from 'react';
import { Link } from 'react-router-dom';
import './SpotifyTheme.css'; 

const Home = () => {
  // Simple scroll function for the top "Log In" button
  const scrollToLogin = () => {
    const section = document.getElementById('login-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-container">
      
      {/* 1. TOP NAVIGATION BAR */}
      <nav style={{
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        padding: '20px 40px', 
        display: 'flex', 
        justifyContent: 'space-between', /* FIXED: changed from justify-content */
        alignItems: 'center'
      }}>
        {/* Logo */}
        <div style={{display:'flex', alignItems:'center', color:'white', fontWeight:'bold', fontSize:'24px'}}>
          <span style={{fontSize:'30px', marginRight:'8px'}}>◎</span> Definitely not Spotify
        </div>

        {/* Top Right Login Button (Scrolls to cards) */}
        <div>
           <button 
             onClick={scrollToLogin}
             style={{
               background: 'transparent', 
               color: 'white', 
               border: 'none', 
               fontWeight: 'bold', 
               fontSize: '16px', 
               cursor: 'pointer',
               marginRight: '20px'
             }}
           >
             Log In
           </button>
           
           <Link to="/signup-listener" className="btn-link btn-white-outline" style={{padding: '10px 25px'}}>
             Sign Up
           </Link>
        </div>
      </nav>


      {/* 2. HERO SECTION */}
      <div style={{marginTop: '80px'}}>
        <h1 className="hero-title">Definitely Not Spotify</h1>
        <p className="hero-subtitle">Connect directly with your favorite artists.</p>
      </div>

      {/* 3. LOGIN SELECTION CARDS (ID added for scrolling) */}
      <div id="login-section" className="split-section">
        
        {/* --- LISTENER CARD --- */}
        <div className="user-type-card">
          <span style={{fontSize: '50px', display:'block', marginBottom:'15px'}}>🎧</span>
          <h3 style={{color: '#1DB954'}}>For Listeners</h3>
          <p style={{color: '#b3b3b3', marginBottom: '30px', fontSize: '14px', lineHeight:'1.5'}}>
            Discover new music, create playlists, and listen to your favorites for free.
          </p>
          
          <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            {/* LISTENER LOGIN BUTTON */}
            <Link to="/login-listener" className="btn-link btn-green">
              Log In as Listener
            </Link>
            
            <Link to="/signup-listener" style={{color: 'white', fontSize:'13px', textDecoration:'underline', marginTop:'5px'}}>
              Don't have an account? Sign up
            </Link>
          </div>
        </div>

        {/* --- ARTIST CARD --- */}
        <div className="user-type-card">
          <span style={{fontSize: '50px', display:'block', marginBottom:'15px'}}>🎸</span>
          <h3 style={{color: '#ff9900'}}>For Artists</h3>
          <p style={{color: '#b3b3b3', marginBottom: '30px', fontSize: '14px', lineHeight:'1.5'}}>
            Upload your tracks, manage your profile, and grow your fanbase.
          </p>
          
          <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            {/* ARTIST LOGIN BUTTON */}
            <Link to="/login-artist" className="btn-link btn-white-outline">
              Log In as Artist
            </Link>

            <Link to="/signup-artist" style={{color: 'white', fontSize:'13px', textDecoration:'underline', marginTop:'5px'}}>
              Artist Sign up
            </Link>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div style={{marginTop: '80px', color: '#555', fontSize: '12px'}}>
        &copy; 2025 Definitely Not Spotify. All rights reserved.
      </div>
    </div>
  );
};

export default Home;