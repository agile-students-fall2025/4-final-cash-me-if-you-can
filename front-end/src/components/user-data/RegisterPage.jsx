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

    const res = await fetch("http://localhost:5001/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, password }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error);

    alert("Account created! Log in now."); 
    navigate("/");
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
              value={firstName}
              onChange={(e) => setFirst(e.target.value)}
              placeholder="First name"
            />
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input 
              value={lastName}
              onChange={(e) => setLast(e.target.value)}
              placeholder="Last name"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create password"
            />
          </div>

          <button className="signin-button">Sign Up</button>
        </form>
      </div>
    </div>
  );
}
