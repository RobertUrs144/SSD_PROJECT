import React from 'react';
import { Link } from 'react-router-dom';
import './SignUpListener.css'; // We reuse the existing CSS for consistency

export default function LandingPage() {
  return (
    <div className="signup-listener-container" style={{flexDirection:'column', gap:'20px'}}>
      
      <div style={{textAlign:'center', marginBottom:'40px'}}>
        <h1 style={{fontSize:'3rem', color:'#333', marginBottom:'10px'}}>Definately not Spotify</h1>
        <p style={{fontSize:'1.2rem', color:'#666'}}>Connect directly with your favorite artists.</p>
      </div>

      <div style={{display:'flex', gap:'30px', flexWrap:'wrap', justifyContent:'center'}}>
        
        {/* LISTENER CARD */}
        <div className="signup-listener-form" style={{maxWidth:'300px', alignItems:'center'}}>
          <h2 style={{color:'#6e8efb'}}>For Listeners</h2>
          <p style={{textAlign:'center', marginBottom:'20px'}}>Discover new music and follow artists directly.</p>
          <div style={{display:'flex', gap:'10px', width:'100%'}}>
            <Link to="/login-listener" className="btn-primary" style={{flex:1, textAlign:'center', textDecoration:'none'}}>Login</Link>
            <Link to="/signup-listener" className="btn-outline" style={{flex:1, textAlign:'center', textDecoration:'none'}}>Sign Up</Link>
          </div>
        </div>

        {/* ARTIST CARD */}
        <div className="signup-listener-form" style={{maxWidth:'300px', alignItems:'center', borderTop:'5px solid #ff9800'}}>
          <h2 style={{color:'#ff9800'}}>For Artists</h2>
          <p style={{textAlign:'center', marginBottom:'20px'}}>Upload songs, notify fans, and manage your profile.</p>
          <div style={{display:'flex', gap:'10px', width:'100%'}}>
            <Link to="/login-artist" className="btn-primary" style={{background:'#ffffffff', flex:1, textAlign:'center', textDecoration:'none'}}>Login</Link>
            <Link to="/signup-artist" className="btn-outline" style={{flex:1, textAlign:'center', textDecoration:'none'}}>Sign Up</Link>
          </div>
        </div>

      </div>
    </div>
  );
}