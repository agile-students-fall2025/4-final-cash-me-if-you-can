import React, { useState } from "react";

export default function RegisterPage() {
  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, password }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error);

    alert("Account created! Log in now.");
  };

  return (
    <form onSubmit={handleSignup}>
      <h2>Register</h2>

      <input value={firstName} onChange={(e) => setFirst(e.target.value)} placeholder="First Name" />

      <input value={lastName} onChange={(e) => setLast(e.target.value)} placeholder="Last Name" />

      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />

      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />

      <button>Sign Up</button>
    </form>
  );
}
