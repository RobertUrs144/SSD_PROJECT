import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUpListener.css';

const SignUpListener = ({ onSignUp }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.username || !form.email || !form.password) {
      return 'Toate câmpurile sunt obligatorii!';
    }
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) {
      return 'Email invalid!';
    }
    if (form.password.length < 6) {
      return 'Parola trebuie să aibă minim 6 caractere!';
    }
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    const listeners = JSON.parse(localStorage.getItem('listeners') || '[]');
    listeners.push(form);
    localStorage.setItem('listeners', JSON.stringify(listeners));
    setError('');
    if (onSignUp) onSignUp();
    navigate('/login-listener');
  };

  return (
    <div className="signup-listener-container">
      <form className="signup-listener-form" onSubmit={handleSubmit}>
        <h2>Sign Up Listener</h2>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
        />
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
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUpListener;
