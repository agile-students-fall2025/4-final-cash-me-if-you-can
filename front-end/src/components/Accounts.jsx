import { useState, useEffect } from 'react';
import './TransactionCategories.css';
import { dashboardAPI } from '../services/api';

var React = require('react');

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await dashboardAPI.getSummary();
      setAccounts(response.accounts || []);
      setTotalBalance(response.total_balance || 0);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setAccounts([]);
      setTotalBalance(0);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="transactions-container">Loading accounts...</div>;
  }

  return (
    <div className="transactions-container">
      <h2>Accounts</h2>

      <div className="transaction-item">
        <div className="transaction-info">
          <div className="transaction-date">Total Balance</div>
          <div className="transaction-description">${totalBalance.toFixed(2)}</div>
        </div>
      </div>

      <div className="transactions-list">
        {accounts.map((account, index) => (
          <div key={index} className="transaction-item">
            <div className="transaction-info">
              <div className="transaction-description">{account.name}</div>
            </div>
            <div className="transaction-right">
              <div className={`transaction-amount ${account.balance < 0 ? 'negative' : 'positive'}`}>
                ${Math.abs(account.balance).toFixed(2)}
              </div>
              {account.type === 'credit' && account.balance < 0 && (
                <div className="transaction-category">owed</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Accounts;