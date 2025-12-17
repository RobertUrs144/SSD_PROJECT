import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { updateProfile, updatePassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './SpotifyTheme.css'; // Ensure you import your shared theme file

export default function EditArtistProfile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [displayName, setDisplayName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false); // Visibility state

    // --- 1. AUTH & DATA LISTENER ---
    useEffect(() => {
        // Ensure the user is authenticated and is an Artist (handled by App.js router)
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setDisplayName(currentUser.displayName || '');
                setLoading(false);
            } else {
                // If not logged in, redirect away (though App.js should catch this)
                navigate('/login-artist');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    // --- 2. HANDLER: SAVE PROFILE CHANGES ---
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setMessage('');

        // 2a. Update Display Name
        if (displayName !== user.displayName) {
            try {
                await updateProfile(user, { displayName: displayName.trim() });
                setMessage('Display name updated successfully.');
            } catch (error) {
                console.error("Error updating display name:", error);
                setMessage('Error updating display name. Please try again.');
                return;
            }
        }

        // 2b. Update Password
        if (newPassword.trim()) {
            if (newPassword.length < 6) {
                setMessage('New password must be at least 6 characters.');
                return;
            }
            try {
                await updatePassword(user, newPassword);
                setMessage('Password updated successfully. Please log in again.');
                
                // Force re-login after password change for security
                await signOut(auth);
                navigate('/login-artist');
                return;

            } catch (error) {
                console.error("Error updating password:", error);
                // Common error: 'auth/requires-recent-login'
                setMessage(`Error updating password: ${error.message}. Please log out, log back in, and try again.`);
                return;
            }
        }
        
        if (!message) {
            setMessage('No changes were made.');
        }
    };

    // --- STYLES (MATCHING SPOTIFY THEME) ---
    const inputStyle = {
        width: '100%',
        padding: '12px',
        borderRadius: '4px',
        border: '1px solid #555',
        backgroundColor: '#333',
        color: 'white',
        fontSize: '14px',
        boxSizing: 'border-box',
        marginBottom: '15px'
    };

    const eyeIconStyle = {
        position: 'absolute',
        right: '12px',
        top: '12px',
        cursor: 'pointer',
        background: 'none',
        border: 'none',
        color: '#b3b3b3',
        fontSize: '18px',
        padding: 0
    };

    if (loading) {
        return <div className="dark-background" style={{ padding: '50px', textAlign: 'center', color: 'white' }}>Loading...</div>;
    }

    return (
        <div className="dark-background" style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
            
            <button 
                onClick={() => navigate('/dashboard-artist')}
                style={{
                    position: 'absolute', 
                    top: '20px', 
                    right: '20px', 
                    backgroundColor: '#333', 
                    color: 'white', 
                    padding: '8px 15px',
                    borderRadius: '20px',
                    border: '1px solid #555',
                    cursor: 'pointer'
                }}
            >
                ← Back to Dashboard
            </button>

            <div style={{ backgroundColor: '#181818', padding: '40px', borderRadius: '8px', width: '450px', border: '1px solid #333' }}>
                <h2 style={{ marginBottom: '30px', fontSize: '2rem', color: '#1DB954' }}>Edit Artist Profile</h2>
                
                {message && (
                    <p style={{ backgroundColor: message.includes("Error") ? '#501515' : '#104d20', padding: '10px', borderRadius: '4px', marginBottom: '20px', border: '1px solid #1DB954' }}>
                        {message}
                    </p>
                )}

                <form onSubmit={handleSaveProfile}>
                    
                    {/* ARTIST NAME */}
                    <label style={{ fontSize: '14px', color: '#b3b3b3', display: 'block', marginBottom: '5px' }}>Artist Name</label>
                    <input 
                        type="text" 
                        value={displayName} 
                        onChange={(e) => setDisplayName(e.target.value)} 
                        placeholder="Display Name"
                        required
                        style={inputStyle} 
                    />

                    {/* EMAIL (Read-only) */}
                    <label style={{ fontSize: '14px', color: '#b3b3b3', display: 'block', marginBottom: '5px' }}>Email Address (Cannot be changed)</label>
                    <input 
                        type="email" 
                        value={user.email} 
                        readOnly
                        style={{ ...inputStyle, backgroundColor: '#222', color: '#999' }} 
                    />

                    {/* NEW PASSWORD */}
                    <label style={{ fontSize: '14px', color: '#b3b3b3', display: 'block', marginBottom: '5px' }}>New Password (Leave blank to keep current)</label>
                    <div style={{ position: 'relative', width: '100%' }}>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                            placeholder="Enter new password (min 6 chars)"
                            style={{ ...inputStyle, paddingRight: '40px', marginBottom: '25px' }} 
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={eyeIconStyle}>
                            {showPassword ? "👁️" : "👁️‍🗨️"}
                        </button>
                    </div>

                    <button type="submit" className="btn-green" style={{ width: '100%', padding: '14px', borderRadius: '30px', fontWeight: 'bold' }}>
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
}