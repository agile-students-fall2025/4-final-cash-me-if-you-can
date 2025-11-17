import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import SettingsPage from './components/SettingsPage';
import { UserProvider } from'./components/user-data/UserContext'
import TransactionCategories from './components/TransactionCategories.jsx';
import ChatbotPage from './components/ChatbotPage.jsx';
import LoginPage from './components/user-data/LoginPage.jsx';
import ConnectAccounts from './components/ConnectAccounts.jsx';
import SpendingGraph from './components/SpendingGraph.jsx';

function AppContent() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LoginPage />} />
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
