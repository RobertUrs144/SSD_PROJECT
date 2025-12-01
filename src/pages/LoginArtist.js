// src/pages/LoginArtist.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import './SignUpListener.css'; // Reuse listener CSS for same style

export default function LoginArtist() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage('Email and password are required');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage('Logged in successfully');
      setTimeout(() => navigate('/dashboard-artist'), 500);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div className="signup-listener-container">
      <div className="signup-listener-form">
        <h2>Login as Artist</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
        {message && <p className="error">{message}</p>}
      </div>
    </div>
  );
}
