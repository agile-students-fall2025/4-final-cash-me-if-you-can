import React, { useState, useEffect } from 'react';
import './ConnectAccounts.css';
import Header from './Header';
import connectedAccountsData from '../data/connectedAccounts.json';
import availableInstitutionsData from '../data/availableInstitutions.json';
import { plaidAPI } from '../services/api';

function ConnectAccounts() {
  const [connectedAccounts, setConnectedAccounts] = useState(connectedAccountsData);
  const availableInstitutions = availableInstitutionsData;
  const [linkToken, setLinkToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load Plaid Link script
    const script = document.createElement('script');
    script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleConnectAccount = async (institution) => {
    setIsLoading(true);
    try {
      // Get link token from backend
      const response = await plaidAPI.createLinkToken();

      if (!response.link_token) {
        alert('Unable to connect. Make sure backend server is running with Plaid credentials.');
        setIsLoading(false);
        return;
      }

      // Initialize Plaid Link
      if (window.Plaid) {
        const handler = window.Plaid.create({
          token: response.link_token,
          onSuccess: async (public_token, metadata) => {
            console.log('Plaid Link success:', metadata);

            // Exchange public token for access token
            try {
              const exchangeResponse = await plaidAPI.exchangePublicToken(public_token);
              console.log('Token exchange success:', exchangeResponse);

              // Get accounts
              const accountsResponse = await plaidAPI.getAccounts(exchangeResponse.access_token);
              console.log('Accounts fetched:', accountsResponse);

              alert(`Successfully connected to ${metadata.institution.name}! Check console for details.`);

              // Update connected accounts list
              // In production, you'd add the new accounts to state
            } catch (error) {
              console.error('Error exchanging token:', error);
              alert('Connected to Plaid but error exchanging token. Check console.');
            }
          },
          onExit: (err, metadata) => {
            if (err) {
              console.error('Plaid Link error:', err);
            }
            console.log('Plaid Link exit:', metadata);
            setIsLoading(false);
          },
        });

        handler.open();
      } else {
        alert('Plaid SDK not loaded. Please refresh the page.');
      }
    } catch (error) {
      console.error('Error creating link token:', error);
      alert('Error connecting to Plaid. Make sure backend is running on port 5000 (or check your .env file).');
    } finally {
      setIsLoading(false);
    }
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
      <Header title="Connect Accounts" subtitle="Securely link your financial accounts using Plaid API" />

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
                  disabled={isLoading}
                >
                  {isLoading ? 'Connecting...' : 'Connect'}
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
