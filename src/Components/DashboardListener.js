import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import "./ui.css";

export default function DashboardListener() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Listener Dashboard</h2>
        <p className="lead">Welcome, listener! This is your dashboard.</p>
        <div style={{ marginTop: 12 }}>
          <button className="btn ghost" onClick={handleSignOut}>Sign Out</button>
        </div>
      </div>
    </div>
  );
}
