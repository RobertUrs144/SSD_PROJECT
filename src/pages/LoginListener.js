import React, { useState } from "react";
import { auth, db, googleProvider } from "../firebase"; 
import { signInWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"; 
import "./SpotifyTheme.css"; 

const LoginListener = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // --- EXISTING EMAIL LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const role = docSnap.data().role;
        // Strict Role Check
        if (role !== "listener") {
          await signOut(auth);
          alert(`Access Denied. This account is registered as an Artist.`);
          return;
        }
        window.location.href = '/';
      } else {
        await signOut(auth);
        alert("Error: User profile not found.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Login Failed: " + error.message);
    }
  };

  // --- NEW GOOGLE LOGIN ---
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // User exists: Check Role
        const role = docSnap.data().role;
        if (role !== "listener") {
          await signOut(auth);
          alert(`Access Denied. This Google account is already registered as an Artist.`);
          return;
        }
      } else {
        // User is NEW: Create Profile as LISTENER
        await setDoc(docRef, {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          role: "listener", // Enforce Listener Role
          createdAt: serverTimestamp(),
        });
      }

      // Success
      window.location.href = '/';

    } catch (error) {
      console.error("Google Login Error:", error);
      alert("Google Sign-In Failed: " + error.message);
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

  return (
    <div className="login-container" style={{ backgroundColor: '#121212', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
      <div style={{ backgroundColor: 'black', padding: '40px', borderRadius: '8px', width: '400px', textAlign: 'center', border: '1px solid #333' }}>
        <h1 style={{ marginBottom: '30px', fontSize:'3rem', marginTop:0 }}>◎</h1>
        <h2 style={{ marginBottom: '20px' }}>Log in (Listener)</h2>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} 
          />
          <div style={{ position: 'relative', width: '100%' }}>
            <input 
              type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ ...inputStyle, paddingRight: '40px' }} 
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', background: 'none', border: 'none', color: '#b3b3b3', fontSize: '18px', padding: 0 }}>
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>

          <button type="submit" style={{ backgroundColor: '#1DB954', color: 'black', padding: '14px', borderRadius: '50px', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}>
            Log In
          </button>
        </form>

        {/* GOOGLE BUTTON */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#333' }}></div>
          <span style={{ padding: '0 10px', color: '#b3b3b3', fontSize: '12px' }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#333' }}></div>
        </div>

        <button onClick={handleGoogleLogin} style={{ width: '100%', backgroundColor: 'white', color: 'black', padding: '12px', borderRadius: '50px', border: '1px solid #b3b3b3', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          {/* FIXED IMAGE URL */}
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" style={{ width: '20px', height: '20px' }} />
          Sign in with Google
        </button>

        <p style={{ marginTop: '20px', color: '#b3b3b3', fontSize: '14px' }}>
          Don't have an account? <a href="/signup-listener" style={{ color: 'white', fontWeight: 'bold', marginLeft: '5px' }}>Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default LoginListener;