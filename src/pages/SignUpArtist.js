import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUpArtist.css';

const SignUpArtist = ({ onSignUp }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    artistName: '',
    email: '',
    password: '',
    genre: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.artistName || !form.email || !form.password || !form.genre) {
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
    // Salvare locală
    const artists = JSON.parse(localStorage.getItem('artists') || '[]');
    artists.push(form);
    localStorage.setItem('artists', JSON.stringify(artists));
    setError('');
    if (onSignUp) onSignUp();
    // redirect to artist login after successful signup
    navigate('/login-artist');
  };

  return (
    <div className="signup-artist-container">
      <form className="signup-artist-form" onSubmit={handleSubmit}>
        <h2>Sign Up Artist</h2>
        <input
          type="text"
          name="artistName"
          placeholder="Artist Name"
          value={form.artistName}
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
        <input
          type="text"
          name="genre"
          placeholder="Genre"
          value={form.genre}
          onChange={handleChange}
        />
        {error && <div className="error">{error}</div>}
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUpArtist;
