import { createContext, useState, useContext } from 'react'
export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null); // null = not logged in

  const login = (userObject) => setUser(userObject);
  const logout = () => setUser(null);

  return (
    <UserContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}
