import { createContext, useState, useEffect } from "react";

var React = require('react');

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Load user from backend on refresh
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${process.env.REACT_APP_API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) setUser(data);
      })
      .catch(() => {});
  }, []);

  const loginUser = (userData, token, isNewUser = false) => {
    setUser(userData);
    if (token) localStorage.setItem("token", token);

    // Show onboarding for new users who haven't seen it yet
    if (isNewUser) {
      const hasSeenOnboarding = localStorage.getItem(`onboarding_${userData._id}`);
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }
  };

  const completeOnboarding = () => {
    if (user) {
      localStorage.setItem(`onboarding_${user._id}`, 'true');
    }
    setShowOnboarding(false);
  };

  const skipOnboarding = () => {
    if (user) {
      localStorage.setItem(`onboarding_${user._id}`, 'true');
    }
    setShowOnboarding(false);
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
    <UserContext.Provider value={{
      user,
      loginUser,
      updateUser,
      logoutUser,
      showOnboarding,
      completeOnboarding,
      skipOnboarding
    }}>
      {children}
    </UserContext.Provider>
  );
}
