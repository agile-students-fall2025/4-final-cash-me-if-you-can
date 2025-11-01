import React, { useState } from 'react';
import './ConnectAccounts.css';
import connectedAccountsData from '../data/connectedAccounts.json';
import availableInstitutionsData from '../data/availableInstitutions.json';

function ConnectAccounts() {
  const [connectedAccounts, setConnectedAccounts] = useState(connectedAccountsData);
  const availableInstitutions = availableInstitutionsData;

  const handleConnectAccount = (institution) => {
    alert(`Connecting to ${institution.name} via Plaid API...`);
  };

  const getAccountIcon = (type) => {
    switch(type) {
      case 'bank':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="4" width="22" height="16" rx="2" />
            <path d="M1 10h22" />
          </svg>
        );
      case 'savings':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        );
      case 'investment':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v18h18" />
            <path d="M18 9l-5 5-4-4-4 4" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="connect-accounts-page">
      <div className="page-header">
        <h1>Connect Accounts</h1>
        <p>Securely link your financial accounts using Plaid API</p>
      </div>

      <div className="accounts-container">
        <section className="connected-section">
          <h2>Connected Accounts</h2>
          {connectedAccounts.length > 0 ? (
            <div className="accounts-grid">
              {connectedAccounts.map((account) => (
                <div key={account.id} className="account-card connected">
                  <div className="account-icon">
                    {getAccountIcon('bank')}
                  </div>
                  <div className="account-info">
                    <h3>{account.institution}</h3>
                    <p className="account-type">{account.accountType} {account.accountNumber}</p>
                    <p className="account-balance">{account.balance}</p>
                  </div>
                  <div className="connected-badge">
                    <span>✓</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No accounts connected yet</p>
          )}
        </section>

        <section className="available-section">
          <h2>Available Institutions</h2>
          <div className="institutions-grid">
            {availableInstitutions.map((institution, index) => (
              <div key={index} className="institution-card">
                <div className="institution-icon">
                  {getAccountIcon(institution.type)}
                </div>
                <div className="institution-info">
                  <h3>{institution.name}</h3>
                  <p className="institution-type">
                    {institution.type === 'bank' && 'Banking'}
                    {institution.type === 'savings' && 'Savings Account'}
                    {institution.type === 'investment' && 'Investment Account'}
                  </p>
                </div>
                <button
                  className="connect-button"
                  onClick={() => handleConnectAccount(institution)}
                >
                  Connect
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default ConnectAccounts;
