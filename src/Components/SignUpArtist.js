import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import "./ui.css";
import { Link } from "react-router-dom";

export default function SignUpArtist() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailExists, setEmailExists] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), { role: "artist", email });
      navigate("/dashboard/artist");
    } catch (err) {
      console.error("SignUpArtist error:", err);
      const code = err.code || "error";
      setError(`${code}: ${err.message}`);
      // If the email is already in use, show link to sign-in
      if (code === "auth/email-already-in-use") {
        setEmailExists(true);
      }
    }
  };

  return (
    <div className="container">
      <div className="card small">
        <h2>Sign Up</h2>
        <p className="lead">Create an artist account</p>
        {error && <div className="small-note" style={{ color: "#b00020" }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>

          <div className="form-row">
            <label>Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn primary" type="submit">Create Artist Account</button>
          </div>
        </form>
        {emailExists && (
          <div style={{ marginTop: 12 }}>
            <p className="small-note">That email is already registered.</p>
            <Link to="/signin/artist" className="btn ghost">Go to Sign In</Link>
          </div>
        )}
      </div>
    </div>
  );
}
