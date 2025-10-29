import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import TransactionCategories from './components/TransactionCategories';
import ChatbotPage from './components/ChatbotPage';
import SettingsPage from './components/SettingsPage'

function HomePage() {
  return (
    <div className="home-page">
      <h1>cash me if you can</h1>
    </div>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <Router>
      <div className="App">
        <div className="hamburger" onClick={toggleMenu}>
          <div></div>
          <div></div>
          <div></div>
        </div>

        <div className={`menu ${menuOpen ? 'open' : ''}`}>
          <div className="menu-content">
            <Link to="/" onClick={closeMenu}>Home</Link>
            <Link to="/chatbot" onClick={closeMenu}>Financial Assistant</Link>
            <Link to="/categorize" onClick={closeMenu}>Categorize Transactions</Link>
            <Link to="/settings" onClick={closeMenu}>Settings</Link>
          </div>
        </div>

        {menuOpen && <div className="overlay" onClick={closeMenu}></div>}

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/categorize" element={<TransactionCategories />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
