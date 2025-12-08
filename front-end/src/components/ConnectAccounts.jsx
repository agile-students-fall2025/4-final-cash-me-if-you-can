import React, { useState, useEffect } from 'react';
import './ConnectAccounts.css';
import { accountAPI } from '../services/api';

function ConnectAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    bank_name: '',
    name: '',
    type: 'depository',
    subtype: 'checking',
    current_balance: '',
    mask: ''
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setIsLoading(true);
    try {
      const response = await accountAPI.getAccounts();
      setAccounts(response.accounts || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const accountData = {
        ...formData,
        current_balance: parseFloat(formData.current_balance)
      };

      const response = await accountAPI.createAccount(accountData);

      // Add the new account to the list
      setAccounts(prev => [...prev, response]);

      // Reset form
      setFormData({
        bank_name: '',
        name: '',
        type: 'depository',
        subtype: 'checking',
        current_balance: '',
        mask: ''
      });
      setShowAddForm(false);

      // Reload accounts to get latest data
      loadAccounts();
    } catch (error) {
      console.error('Error creating account:', error);
      alert('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (!window.confirm('Are you sure you want to delete this account?')) {
      return;
    }

    try {
      await accountAPI.deleteAccount(accountId);
      setAccounts(prev => prev.filter(acc => acc.account_id !== accountId));
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again.');
    }
  };

  const getAccountIcon = (type, subtype) => {
    if (type === 'credit' || subtype === 'credit card') {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="4" width="22" height="16" rx="2" />
          <path d="M1 10h22" />
        </svg>
      );
    } else if (type === 'depository' && subtype === 'savings') {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      );
    } else if (type === 'investment') {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3v18h18" />
          <path d="M18 9l-5 5-4-4-4 4" />
        </svg>
      );
    } else {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    }
  };

  const formatBalance = (balance) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(balance);
  };

  const getAccountTypeLabel = (type, subtype) => {
    if (type === 'depository') {
      return subtype.charAt(0).toUpperCase() + subtype.slice(1);
    } else if (type === 'credit') {
      return 'Credit Card';
    } else if (type === 'investment') {
      return 'Investment';
    }
    return type;
  };

  return (
    <div className="connect-accounts-page">
      <div className="page-header">
        <h1>My Accounts</h1>
        <p>Manage your financial accounts</p>
      </div>

      <div className="accounts-container">
        <section className="connected-section">
          <div className="section-header">
            <h2>Your Accounts</h2>
            <button
              className="add-account-btn"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? 'Cancel' : '+ Add Account'}
            </button>
          </div>

          {showAddForm && (
            <div className="add-account-form">
              <h3>Add New Account</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Bank/Institution Name *</label>
                    <input
                      type="text"
                      name="bank_name"
                      value={formData.bank_name}
                      onChange={handleInputChange}
                      placeholder="e.g., Chase, Bank of America"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Account Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Student Checking"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Account Type *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="depository">Depository</option>
                      <option value="credit">Credit</option>
                      <option value="investment">Investment</option>
                      <option value="loan">Loan</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Subtype *</label>
                    <select
                      name="subtype"
                      value={formData.subtype}
                      onChange={handleInputChange}
                      required
                    >
                      {formData.type === 'depository' && (
                        <>
                          <option value="checking">Checking</option>
                          <option value="savings">Savings</option>
                          <option value="money market">Money Market</option>
                        </>
                      )}
                      {formData.type === 'credit' && (
                        <>
                          <option value="credit card">Credit Card</option>
                        </>
                      )}
                      {formData.type === 'investment' && (
                        <>
                          <option value="brokerage">Brokerage</option>
                          <option value="401k">401k</option>
                          <option value="ira">IRA</option>
                        </>
                      )}
                      {formData.type === 'loan' && (
                        <>
                          <option value="student">Student Loan</option>
                          <option value="mortgage">Mortgage</option>
                          <option value="auto">Auto Loan</option>
                        </>
                      )}
                      {formData.type === 'other' && (
                        <option value="other">Other</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Current Balance *</label>
                    <input
                      type="number"
                      name="current_balance"
                      value={formData.current_balance}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last 4 Digits (Optional)</label>
                    <input
                      type="text"
                      name="mask"
                      value={formData.mask}
                      onChange={handleInputChange}
                      placeholder="1234"
                      maxLength="4"
                    />
                  </div>
                </div>

                <button type="submit" className="submit-btn" disabled={isLoading}>
                  {isLoading ? 'Adding...' : 'Add Account'}
                </button>
              </form>
            </div>
          )}

          {isLoading && !showAddForm ? (
            <p className="loading-state">Loading accounts...</p>
          ) : accounts.length > 0 ? (
            <div className="accounts-grid">
              {accounts.map((account) => (
                <div key={account.account_id} className="account-card">
                  <div className="account-header">
                    <div className="account-icon">
                      {getAccountIcon(account.type, account.subtype)}
                    </div>
                    <h3>{account.bank_name}</h3>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteAccount(account.account_id)}
                      title="Delete account"
                    >
                      ×
                    </button>
                  </div>
                  <div className="account-info">
                    <p className="account-name">{account.name}</p>
                    <p className="account-type">
                      {getAccountTypeLabel(account.type, account.subtype)}
                      {account.mask && ` •••• ${account.mask}`}
                    </p>
                    <p className={`account-balance ${account.type === 'credit' ? 'credit' : ''}`}>
                      {formatBalance(account.balances?.current || 0)}
                      {account.type === 'credit' && account.balances?.limit && (
                        <span className="credit-limit">
                          {' '}/ {formatBalance(account.balances.limit)} limit
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">
              No accounts yet. Click "Add Account" to get started!
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

export default ConnectAccounts;
