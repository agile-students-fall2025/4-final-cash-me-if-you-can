import { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  // Load user from backend on refresh
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:5001/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) setUser(data);
      })
      .catch(() => {});
  }, []);

  const loginUser = (userData, token) => {
    setUser(userData);
    if (token) localStorage.setItem("token", token);
  };

  const updateUser = (updatedFields) => {
    if(!updatedFields) return;
    setUser((prev) => ({ ...prev, ...updatedFields }));
  };

  const logoutUser = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, loginUser, updateUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
}
