import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

export default function RegisterPage() {
  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();


  const handleSignup = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!firstName.trim()) {
      return alert("Please enter your first name");
    }
    if (!lastName.trim()) {
      return alert("Please enter your last name");
    }
    if (!email.trim()) {
      return alert("Please enter your email");
    }
    if (!password.trim()) {
      return alert("Please enter a password");
    }
    if (password.length < 6) {
      return alert("Password must be at least 6 characters long");
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.error || "Registration failed");

      alert("Account created! Log in now.");
      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);
      alert("Failed to connect to server. Please try again.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Create Account</h1>
          <p>Join us and start tracking your finances</p>
        </div>

        <form className="login-form" onSubmit={handleSignup}>
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirst(e.target.value)}
              placeholder="First name"
              required
            />
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLast(e.target.value)}
              placeholder="Last name"
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create password"
              minLength="6"
              required
            />
          </div>

          <button className="signin-button">Sign Up</button>
        </form>
      </div>
    </div>
  );
}
