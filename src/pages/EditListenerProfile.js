import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { updatePassword, updateProfile } from 'firebase/auth';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'; // Eye icons
import './SignUpListener.css';

export default function EditListenerProfile() {
  const user = auth.currentUser;
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpdateProfile = async () => {
    try {
      if (!user) {
        setMessage('No user is logged in');
        return;
      }

      if (displayName !== user.displayName) {
        await updateProfile(user, { displayName });
      }

      if (password) {
        await updatePassword(user, password);
      }

      setMessage('Profile updated successfully!');
      setPassword('');
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div className="signup-listener-container">
      <div className="signup-listener-form">
        <h2>Edit Profile</h2>

        <label>Username</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Username"
        />

        <label>Email (read-only)</label>
        <input type="email" value={user?.email || ''} disabled />

        <label>New Password</label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            style={{ flex: 1, paddingRight: '2rem' }}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '0.5rem',
              cursor: 'pointer',
              fontSize: '1.25rem',
              color: '#6b6f9a'
            }}
          >
            {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </span>
        </div>

        <button className="btn btn-primary" onClick={handleUpdateProfile} style={{ marginTop: '1rem' }}>
          Update Profile
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard-listener')} style={{ marginTop: '0.5rem' }}>
          Cancel
        </button>

        {message && <p className="error">{message}</p>}
      </div>
    </div>
  );
}
