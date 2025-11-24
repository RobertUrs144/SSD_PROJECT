import "../Components/Login.css";
import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome</h2>
        <p>Select your role and action:</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Link to="/signin/listener" className="submit-button">Sign In as Listener</Link>
          <Link to="/signup/listener" className="submit-button">Sign Up as Listener</Link>
          <Link to="/signin/artist" className="submit-button">Sign In as Artist</Link>
          <Link to="/signup/artist" className="submit-button">Sign Up as Artist</Link>
        </div>
      </div>
    </div>
  );
}
