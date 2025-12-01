import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import "./LoginPage.css";

function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });

  const { login } = useContext(UserContext);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isSignUp
      ? "http://localhost:5000/api/auth/signup"
      : "http://localhost:5000/api/auth/login";

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    if (isSignUp) {
      alert("Account created! Please log in.");
      setIsSignUp(false);
      return;
    }

    // Save JWT
    localStorage.setItem("token", data.token);

    // Store user globally
    login(data.user);

    navigate("/home");
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>cash me if you can</h1>
          <p>{isSignUp ? "Create your account" : "Sign in to your account"}</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {isSignUp && (
            <>
              <div className="form-group">
                <label>First Name</label>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Last Name</label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="signin-button">
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>

          <div className="form-footer">
            <button
              type="button"
              className="toggle-mode"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Need an account? Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
