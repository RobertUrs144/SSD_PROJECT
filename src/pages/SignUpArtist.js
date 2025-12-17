import React, { useState } from "react";
import { auth, db } from "../firebase"; 
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import "./SpotifyTheme.css"; 

const SignupArtist = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // VISIBILITY STATE
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    
    // 1. Basic Validation
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      // 2. Create User in Firebase Auth (This step automatically logs the user in)
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const user = res.user;

      // 3. Update Display Name
      await updateProfile(user, { displayName: name });
      
      // 4. CRITICAL: GUARANTEE ROLE WRITE COMPLETES
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: name,
        role: "artist", 
        createdAt: new Date()
      });
      
      // 5. FORCE REDIRECT: Ensure App.js reads the new role and redirects successfully.
      window.location.href = '/'; 

    } catch (error) {
      console.error("Signup Error:", error);
      
      // 6. Specific Error Handling
      if (error.code === 'auth/email-already-in-use') {
        alert("This email is already registered. Please Log In instead.");
      } else if (error.code === 'auth/weak-password') {
        alert("Password should be at least 6 characters.");
      } else {
        alert("Signup Failed: " + error.message);
      }
    }
  };

  // --- STYLES ---
  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #555',
    backgroundColor: '#121212',
    color: 'white',
    fontSize: '14px',
    boxSizing: 'border-box'
  };

  const eyeIconStyle = {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    color: '#b3b3b3',
    fontSize: '18px',
    padding: 0
  };

  return (
    <div className="login-container" style={{ backgroundColor: '#121212', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
      <div style={{ backgroundColor: 'black', padding: '40px', borderRadius: '8px', width: '400px', textAlign: 'center', border: '1px solid #333' }}>
        <h1 style={{ marginBottom: '30px', fontSize:'3rem', marginTop:0 }}>◎</h1>
        <h2 style={{ marginBottom: '20px' }}>Sign up (Artist)</h2>
        
        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <input 
            type="text" 
            placeholder="Artist Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            style={inputStyle} 
          />
          
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={inputStyle} 
          />

          {/* PASSWORD FIELD */}
          <div style={{ position: 'relative', width: '100%' }}>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ ...inputStyle, paddingRight: '40px' }} 
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={eyeIconStyle}>
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>

          {/* CONFIRM PASSWORD FIELD */}
          <div style={{ position: 'relative', width: '100%' }}>
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              placeholder="Confirm Password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ ...inputStyle, paddingRight: '40px' }} 
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={eyeIconStyle}>
              {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>

          <button type="submit" style={{ backgroundColor: '#1DB954', color: 'black', padding: '14px', borderRadius: '50px', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}>
            Sign Up as Artist
          </button>
        </form>

        <p style={{ marginTop: '20px', color: '#b3b3b3', fontSize: '14px' }}>
          Already have an artist account? <a href="/login-artist" style={{ color: 'white', fontWeight: 'bold', marginLeft: '5px' }}>Log in</a>
        </p>
      </div>
    </div>
  );
};

export default SignupArtist;