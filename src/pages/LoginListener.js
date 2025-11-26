import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginListener.css';

const LoginListener = ({ onLogin }) => {
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
    const listeners = JSON.parse(localStorage.getItem('listeners') || '[]');
    const user = listeners.find(
      (l) => l.email === form.email && l.password === form.password
    );
    if (!user) {
      setError('Email sau parolă incorectă!');
      return;
    }
    setError('');
    if (onLogin) onLogin(user);
    // navigate to listener dashboard
    navigate('/dashboard-listener');
  };

  return (
    <div className="login-listener-container">
      <form className="login-listener-form" onSubmit={handleSubmit}>
        <h2>Login Listener</h2>
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

export default LoginListener;
