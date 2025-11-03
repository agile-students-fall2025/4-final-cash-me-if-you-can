import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import SettingsPage from './components/SettingsPage';
import { UserProvider } from'./components/user-data/UserContext'
import TransactionCategories from './components/TransactionCategories.jsx';
import ChatbotPage from './components/ChatbotPage.jsx';
import LoginPage from './components/user-data/LoginPage.jsx';
import ConnectAccounts from './components/ConnectAccounts.jsx';
import SpendingGraph from './components/SpendingGraph.jsx';

function HomePage() {
  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>cash me if you can</h1>
        <p className="home-description">
          Your all-in-one financial management platform. Track your transactions,
          categorize expenses, and chat with our AI financial assistant to get
          personalized insights about your spending habits.
        </p>
      </div>

      <div className="features-grid">
        <Link to="/chatbot" className="feature-card">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h3>AI Chatbot</h3>
          <p>Get personalized financial advice and insights from our intelligent assistant</p>
        </Link>

        <div className="feature-card">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
          </div>
          <h3>Dashboards</h3>
          <p>Visualize your spending patterns and financial health at a glance</p>
        </div>

        <Link to="/connect" className="feature-card">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" />
              <path d="M1 10h22" />
            </svg>
          </div>
          <h3>Connect Accounts</h3>
          <p>Securely link your bank accounts and credit cards in one place</p>
        </Link>

        <Link to="/categorize" className="feature-card">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
            </svg>
          </div>
          <h3>Expense Categorization</h3>
          <p>Automatically organize and categorize your transactions</p>
        </Link>
      </div>
    </div>
  );
}

function AppContent() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleLogout = () => {
    closeMenu();
    navigate('/');
  };

  return (
    <div className="App">
      <div className="hamburger" onClick={toggleMenu}>
        <div></div>
        <div></div>
        <div></div>
      </div>

      <div className={`menu ${menuOpen ? 'open' : ''}`}>
        <div className="menu-content">
          <Link to="/home" onClick={closeMenu}>Home</Link>
          <Link to="/dashboard" onClick={closeMenu}>Dashboard</Link>
          <Link to="/chatbot" onClick={closeMenu}>Financial Assistant</Link>
          <Link to="/connect" onClick={closeMenu}>Connect Accounts</Link>
          <Link to="/categorize" onClick={closeMenu}>Categorize Transactions</Link>
          <Link to="/settings" onClick={closeMenu}>Settings</Link>
          <button className="logout-button" onClick={handleLogout}>Log Out</button>
        </div>
      </div>

      {menuOpen && <div className="overlay" onClick={closeMenu}></div>}

      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/chatbot" element={<ChatbotPage />} />
        <Route path="/connect" element={<ConnectAccounts />} />
        <Route path="/categorize" element={<TransactionCategories />} />
        <Route path="/dashboard" element={<SpendingGraph />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
}

export default App;
