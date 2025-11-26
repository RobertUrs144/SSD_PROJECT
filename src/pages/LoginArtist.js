import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginArtist.css';

const LoginArtist = ({ onLogin }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const artists = JSON.parse(localStorage.getItem('artists') || '[]');
    const user = artists.find(
      (a) => a.email === form.email && a.password === form.password
    );
    if (!user) {
      setError('Email sau parolă incorectă!');
      return;
    }
    setError('');
    if (onLogin) onLogin(user);
    // navigate to artist dashboard (route to be implemented)
    navigate('/dashboard-artist');
  };

  return (
    <div className="login-artist-container">
      <form className="login-artist-form" onSubmit={handleSubmit}>
        <h2>Login Artist</h2>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />
        {error && <div className="error">{error}</div>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginArtist;
