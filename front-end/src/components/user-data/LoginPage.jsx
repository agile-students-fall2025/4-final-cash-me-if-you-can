import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "./UserContext";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

export default function LoginPage() {
  const { loginUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!email.trim()) {
      return alert("Please enter your email");
    }
    if (!password.trim()) {
      return alert("Please enter your password");
    }

    try {
      const res = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.error || "Login failed");

      localStorage.setItem("token", data.token);
      loginUser(data.user, data.token);

      navigate("/chatbot");
    } catch (error) {
      console.error("Login error:", error);
      alert("Failed to connect to server. Please try again.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Log in to access your dashboard</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          <button className="signin-button" type="submit">
            Login
          </button>

          <div className="form-footer">
            <Link to="/register" className="forgot-password">
              No account? Register here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
