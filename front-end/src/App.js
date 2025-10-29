import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import TransactionCategories from './components/TransactionCategories';
import ChatbotPage from './components/ChatbotPage';
import LoginPage from './components/LoginPage';

function HomePage() {
  return (
    <div className="home-page">
      <h1>cash me if you can</h1>
      <p className="home-description">
        Your all-in-one financial management platform. Track your transactions,
        categorize expenses, and chat with our AI financial assistant to get
        personalized insights about your spending habits.
      </p>
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
            <Link to="/home" onClick={closeMenu}>Home</Link>
            <Link to="/chatbot" onClick={closeMenu}>Financial Assistant</Link>
            <Link to="/categorize" onClick={closeMenu}>Categorize Transactions</Link>
          </div>
        </div>

        {menuOpen && <div className="overlay" onClick={closeMenu}></div>}

        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/categorize" element={<TransactionCategories />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
