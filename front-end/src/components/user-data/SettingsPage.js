import React, { useContext, useState } from "react";
import { UserContext } from "./UserContext";

export default function SettingsPage() {
  const { user, updateUser } = useContext(UserContext);

  const [firstName, setFirst] = useState(user?.firstName || "");
  const [lastName, setLast] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");

  const handleSave = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/users/me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ firstName, lastName, email, password }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error);

    updateUser(data.user);
    alert("Profile updated!");
  };

  return (
    <div>
      <h2>Settings</h2>

      <input value={firstName} onChange={(e) => setFirst(e.target.value)} />
      <input value={lastName} onChange={(e) => setLast(e.target.value)} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} />

      <button onClick={handleSave}>Save</button>
    </div>
  );
}
