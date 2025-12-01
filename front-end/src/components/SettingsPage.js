import React, { createContext, useState, useContext } from 'react';
import './SettingsPage.css';
import LoginPage from './user-data/LoginPage.jsx'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { UserContext } from './user-data/UserContext' 



function SettingsPage() {
    const handleSave = async () => {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/users/me", {
            method: "PATCH",
            headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password: user.password
            })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error);
            return;
        }

        alert("Profile updated!");

        // refresh context with returned user
        changeFirstName(data.user.firstName);
        changeLastName(data.user.lastName);
        changeEmail(data.user.email);
    };
    const { user, changeFirstName, changeLastName, changeEmail, changePassword, resetUser } = useContext(UserContext);
    return(
        <div className="settings-page">
            <h1>Settings</h1>
            <div className="setting">
                <h2>User Settings</h2>
                <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                    type="text"
                    id="firstName"
                    value={user.firstName}
                    onChange={(e) => changeFirstName(e.target.value)}

                    placeholder={user.firstName}
                    required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                    type="text"
                    id="lastName"
                    value={user.lastName}
                    onChange={(e) => changeLastName(e.target.value)}
                    
                    placeholder={user.lastName}
                    required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                    type="text"
                    id="email"
                    value={user.email}
                    onChange={(e) => changeEmail(e.target.value)}
                    
                    placeholder={user.email}
                    required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                    type="text"
                    id="password"
                    value={user.password}
                    onChange={(e) => changePassword(e.target.value)}
                    
                    placeholder={user.email}
                    required
                    />
                </div>
                <button onClick={handleSave}>Save Changes</button>
            </div>
        
        </div>
    );
}

export default SettingsPage;