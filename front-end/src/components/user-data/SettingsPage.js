import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "./UserContext";
import "./LoginPage.css";

export default function SettingsPage() {
  const { user, updateUser } = useContext(UserContext);

  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);

  // Fill form fields when user data loads
  useEffect(() => {
    if (user) {
      setFirst(user.firstName || "");
      setLast(user.lastName || "");
      setEmail(user.email || "");
      setLoading(false);
    }
  }, [user]);

  const handleSave = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:5001/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.error);

      // Merge updated fields into context
      const updatedUser = data.user || data
      updateUser(updatedUser);

      alert("Profile updated!");
      setPassword(""); // clear password field
    } catch (err) {
      alert("Failed to update profile: " + err.message);
    }
  };

  if (loading) return <div>Loading your profile...</div>;

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>User Settings</h1>
          <p>Update your profile & preferences</p>
        </div>

        <div className="login-form">
          <div className="form-group">
            <label>First Name</label>
            <input 
              value={firstName}
              onChange={(e) => setFirst(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input 
              value={lastName}
              onChange={(e) => setLast(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input 
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="signin-button" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
