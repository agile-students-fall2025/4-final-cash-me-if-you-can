import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

function Header({ title, subtitle }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  const handleLogoClick = () => {
    navigate('/chatbot');
  };

  return (
    <div className="page-header">
      <div className="logo-container" onClick={handleLogoClick}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="logo-icon">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" />
          <path d="M2 17L12 22L22 17" />
          <path d="M2 12L12 17L22 12" />
        </svg>
        <span className="logo-text">cash me if you can</span>
      </div>
      <div className="header-content">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Header;
