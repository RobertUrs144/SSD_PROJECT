import { Link } from "react-router-dom";
import "./ui.css";

export default function Home() {
  return (
    <div className="container">
      <div className="card small">
        <h1>Welcome</h1>
        <p className="lead">Choose an action:</p>
        <div className="link-list">
          <Link className="btn primary" to="/signup/listener">Sign Up as Listener</Link>
          <Link className="btn primary" to="/signup/artist">Sign Up as Artist</Link>
          <Link className="btn ghost" to="/signin/listener">Sign In as Listener</Link>
          <Link className="btn ghost" to="/signin/artist">Sign In as Artist</Link>
        </div>
      </div>
    </div>
  );
}
