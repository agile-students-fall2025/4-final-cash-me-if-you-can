import { createContext, useState, useContext } from 'react'

export const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState({ 
        firstName: '', 
        lastName: '', 
        email: '', 
        password:'' 
    })

    const changeFirstName = (firstName) => {
        setUser((prev) => ({ ...prev, firstName }))
    };

    const changeLastName = (lastName) => {
        setUser((prev) => ({ ...prev, lastName }))
    };

    const changeEmail = (email) => {
        setUser((prev) => ({ ...prev, email }))
    };

    const changePassword = (password) => {
        setUser((prev) => ({ ...prev, password }))
    };
    
    const resetUser = () => {
        setUser({ firstName: '', lastName: '', email: '', password: '' });
    };

    return (
        <UserContext.Provider 
            value={{ 
                user, 
                setUser,
                changeFirstName,
                changeLastName,
                changeEmail,
                changePassword,
                resetUser
            }}
        >
            {children}
        </UserContext.Provider>
    )
}