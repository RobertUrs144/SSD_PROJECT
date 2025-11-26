import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="home-container">
      <div className="home-card">
        <h1>Welcome</h1>
        <p className="home-sub">Alege o opțiune pentru a continua</p>
        <div className="home-buttons">
          <button className="btn btn-primary" onClick={() => navigate('/signup-listener')}>Sign Up Listener</button>
          <button className="btn btn-secondary" onClick={() => navigate('/signup-artist')}>Sign Up Artist</button>
          <button className="btn btn-outline" onClick={() => navigate('/login-listener')}>Login Listener</button>
          <button className="btn btn-outline" onClick={() => navigate('/login-artist')}>Login Artist</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
