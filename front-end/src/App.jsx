import React, { useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import SettingsPage from './components/user-data/SettingsPage';
import { UserProvider, UserContext } from'./components/user-data/UserContext'
import TransactionCategories from './components/TransactionCategories.jsx';
import ChatbotPage from './components/ChatbotPage.jsx';
import LoginPage from './components/user-data/LoginPage.jsx';
import RegisterPage from './components/user-data/RegisterPage.jsx';
import ConnectAccounts from './components/ConnectAccounts.jsx';
import Dashboard from './components/Dashboard.jsx';
import RecurringTransactions from './components/RecurringTransactions.jsx';
import NetWorth from './components/NetWorth.jsx';
import DiamondLogo from './components/icons/DiamondLogo';

function HomePage() {
  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Clarity AI</h1>
        <p className="home-description">
          Your intelligent financial management platform. Track transactions,
          analyze spending patterns, and get personalized AI-powered insights
          about your financial health.
        </p>
      </div>

      <div className="features-grid">
        <Link to="/chatbot" className="feature-card">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h3>AI Assistant</h3>
          <p>Get personalized financial advice and insights from our intelligent assistant</p>
        </Link>

        <Link to="/dashboard" className="feature-card">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
          </div>
          <h3>Dashboard</h3>
          <p>Visualize your spending patterns and financial health at a glance</p>
        </Link>

        <Link to="/connect" className="feature-card">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" />
              <path d="M1 10h22" />
            </svg>
          </div>
          <h3>Manage Accounts</h3>
          <p>Add and manage your bank accounts and credit cards in one place</p>
        </Link>

        <Link to="/categorize" className="feature-card">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
            </svg>
          </div>
          <h3>Transactions</h3>
          <p>Add, edit, and categorize your transactions with ease</p>
        </Link>

        <Link to="/recurring" className="feature-card">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
            </svg>
          </div>
          <h3>Recurring Transactions</h3>
          <p>Set up and manage your recurring income and expenses</p>
        </Link>

        <Link to="/networth" className="feature-card">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path d="M9 12h6M12 9v6" />
            </svg>
          </div>
          <h3>Net Worth</h3>
          <p>Track your total assets, liabilities, and financial health</p>
        </Link>
      </div>
    </div>
  );
}

function AppContent() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logoutUser } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if we're on a public page (login/register)
  const isPublicPage = location.pathname === '/' || location.pathname === '/register';

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleAuth = () => {
    closeMenu();

    if (user) {
      logoutUser();
      localStorage.removeItem("token");
      navigate("/");
    } else {
      navigate("/");
    }
  };

  // Check if we're on the chatbot page (it has its own menu trigger)
  const isChatbotPage = location.pathname === '/chatbot';
  // Check if we're on login or register page (hide menu trigger)
  const isAuthPage = location.pathname === '/' || location.pathname === '/register';

  return (
    <div className="App">
      {/* Diamond Logo Menu Trigger - hidden on chatbot and auth pages */}
      {!isChatbotPage && !isAuthPage && !isPublicPage &&(
        <div className="menu-trigger" onClick={toggleMenu}>
          <DiamondLogo size={36} className="menu-logo" />
        </div>
      )}

      {/* Sidebar Menu */}
      <div className={`menu ${menuOpen ? 'open' : ''}`}>
        <div className="menu-header">
          <DiamondLogo size={32} />
          <span className="menu-brand">CLARITY AI</span>
        </div>
        <div className="menu-content">
          <Link to="/chatbot" onClick={closeMenu}>Financial Assistant</Link>
          <Link to="/dashboard" onClick={closeMenu}>Dashboard</Link>
          <Link to="/networth" onClick={closeMenu}>Net Worth</Link>
          <Link to="/categorize" onClick={closeMenu}>Transactions</Link>
          <Link to="/recurring" onClick={closeMenu}>Recurring</Link>
          <Link to="/connect" onClick={closeMenu}>Manage Accounts</Link>
          <Link to="/settings" onClick={closeMenu}>Settings</Link>
          <button className="logout-button" onClick={handleAuth}>
            {user ? "Log out" : "Login"}
          </button>
        </div>
      </div>

      {menuOpen && <div className="overlay" onClick={closeMenu}></div>}

      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/chatbot" element={<ChatbotPage onMenuOpen={toggleMenu} />} />
        <Route path="/connect" element={<ConnectAccounts />} />
        <Route path="/categorize" element={<TransactionCategories />} />
        <Route path="/recurring" element={<RecurringTransactions />} />
        <Route path="/networth" element={<NetWorth />} />
        <Route path="/dashboard" element={<Dashboard />} />
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
