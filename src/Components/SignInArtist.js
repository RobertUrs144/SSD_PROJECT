import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import "./ui.css";

export default function SignInArtist() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const docSnap = await getDoc(doc(db, "users", user.uid));
      const data = docSnap.exists() ? docSnap.data() : null;
      if (data && data.role === "artist") {
        navigate("/dashboard/artist");
      } else if (data && data.role === "listener") {
        navigate("/dashboard/listener");
      } else {
        navigate("/dashboard/artist");
      }
    } catch (err) {
      console.error("SignInArtist error:", err);
      setError(`${err.code || "error"}: ${err.message}`);
    }
  };

  return (
    <div className="container">
      <div className="card small">
        <h2>Sign In</h2>
        <p className="lead">Sign in as artist</p>
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
            <button className="btn primary" type="submit">Sign In as Artist</button>
          </div>
        </form>
      </div>
    </div>
  );
}
