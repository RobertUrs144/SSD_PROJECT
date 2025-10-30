import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import "../Components/Login.css"; 

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleRegister = () => {
    if (!username || !password) {
      setError("Please fill in both username and password.");
      setSuccess("");
      return;
    }
    const users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.find((u) => u.username === username)) {
      setError("Username already exists.");
      setSuccess("");
      return;
    }
    users.push({ username, password });
    localStorage.setItem("users", JSON.stringify(users));
    setSuccess("Account created! You can now log in.");
    setError("");
    setUsername("");
    setPassword("");
  };

  const handleLogin = () => {
    if (!username || !password) {
      setError("Please fill in both fields.");
      return;
    }
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find((u) => u.username === username && u.password === password);
    if (!user) {
      setError("Invalid username or password.");
      return;
    }
    localStorage.setItem("loggedInUser", JSON.stringify(user));
    setError("");
    alert(`Welcome, ${username}!`);
    setUsername("");
    setPassword("");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="tabs">
          <button
            className={isLogin ? "tab active" : "tab"}
            onClick={() => { setIsLogin(true); setError(""); setSuccess(""); }}
          >
            Login
          </button>
          <button
            className={!isLogin ? "tab active" : "tab"}
            onClick={() => { setIsLogin(false); setError(""); setSuccess(""); }}
          >
            Register
          </button>
        </div>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="input-field"
        />

        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="input-field"
          />
          <button
            type="button"
            className="eye-button"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>

        <button
          className="submit-button"
          onClick={isLogin ? handleLogin : handleRegister}
        >
          {isLogin ? "Login" : "Create Account"}
        </button>

        <div className="switch-text">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={() => { setIsLogin(!isLogin); setError(""); setSuccess(""); }}>
            {isLogin ? "Register" : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
