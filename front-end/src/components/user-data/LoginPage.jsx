import React, { useState, useContext } from "react";
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

    const res = await fetch("http://localhost:5001/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error);

    localStorage.setItem("token", data.token);
    loginUser(data.user);

    navigate("/settings");
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>

      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />

      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />

      <button type="submit">Login</button>
    </form>
  );
}
