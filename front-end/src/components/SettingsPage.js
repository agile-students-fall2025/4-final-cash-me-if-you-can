import React, { useState } from 'react';
import './SettingsPage.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

function SettingsPage() {
    return(
        <div className="settings-page">
            <h1>Settings</h1>
            <p>***Settings here***</p>
        </div>
    );
}

export default SettingsPage;