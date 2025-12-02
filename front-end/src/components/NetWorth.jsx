import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import './NetWorth.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function NetWorth() {
  const [accounts, setAccounts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accountsRes, summaryRes] = await Promise.all([
        fetch(`${API_BASE_URL}/accounts`),
        fetch(`${API_BASE_URL}/dashboard/summary`)
      ]);
      const accountsData = await accountsRes.json();
      const summaryData = await summaryRes.json();

      // Ensure accountsData is an array
      setAccounts(Array.isArray(accountsData) ? accountsData : []);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading data:', error);
      setAccounts([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateNetWorth = () => {
    const assets = accounts
      .filter(acc => acc.subtype !== 'credit card' && acc.balances.current >= 0)
      .reduce((sum, acc) => sum + acc.balances.current, 0);

    const liabilities = accounts
      .filter(acc => acc.subtype === 'credit card' || acc.balances.current < 0)
      .reduce((sum, acc) => sum + Math.abs(acc.balances.current), 0);

    return {
      assets,
      liabilities,
      netWorth: assets - liabilities
    };
  };

  const getAccountsByType = () => {
    const checking = accounts.filter(acc => acc.subtype === 'checking');
    const savings = accounts.filter(acc => acc.subtype === 'savings');
    const credit = accounts.filter(acc => acc.subtype === 'credit card');
    const investment = accounts.filter(acc => acc.subtype === 'investment');
    const other = accounts.filter(acc => !['checking', 'savings', 'credit card', 'investment'].includes(acc.subtype));

    return { checking, savings, credit, investment, other };
  };

  const getPieChartData = () => {
    const { checking, savings, credit, investment, other } = getAccountsByType();

    const data = [];

    if (checking.length > 0) {
      data.push({
        name: 'Checking',
        value: checking.reduce((sum, acc) => sum + Math.abs(acc.balances.current), 0)
      });
    }

    if (savings.length > 0) {
      data.push({
        name: 'Savings',
        value: savings.reduce((sum, acc) => sum + Math.abs(acc.balances.current), 0)
      });
    }

    if (investment.length > 0) {
      data.push({
        name: 'Investment',
        value: investment.reduce((sum, acc) => sum + Math.abs(acc.balances.current), 0)
      });
    }

    if (credit.length > 0) {
      data.push({
        name: 'Credit Cards',
        value: credit.reduce((sum, acc) => sum + Math.abs(acc.balances.current), 0)
      });
    }

    if (other.length > 0) {
      data.push({
        name: 'Other',
        value: other.reduce((sum, acc) => sum + Math.abs(acc.balances.current), 0)
      });
    }

    return data;
  };

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{payload[0].name}</p>
          <p className="tooltip-value">${payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="networth-page">
        <div className="loading-state">Loading net worth data...</div>
      </div>
    );
  }

  const { assets, liabilities, netWorth } = calculateNetWorth();
  const pieData = getPieChartData();
  const { checking, savings, credit, investment, other } = getAccountsByType();

  return (
    <div className="networth-page">
      <div className="page-header">
        <h1>Net Worth</h1>
        <p>Track your assets, liabilities, and overall financial health</p>
      </div>

      <div className="networth-container">
        {/* Summary Cards */}
        <div className="networth-summary">
          <div className="summary-card highlight">
            <div className="card-icon networth">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="card-content">
              <p className="card-label">Net Worth</p>
              <h2 className={`card-value ${netWorth >= 0 ? 'positive' : 'negative'}`}>
                ${Math.abs(netWorth).toFixed(2)}
              </h2>
              <p className="card-sublabel">{netWorth >= 0 ? 'Total Assets - Liabilities' : 'Liabilities Exceed Assets'}</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="card-icon assets">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                <path d="M12 5v14" />
              </svg>
            </div>
            <div className="card-content">
              <p className="card-label">Total Assets</p>
              <h2 className="card-value positive">${assets.toFixed(2)}</h2>
            </div>
          </div>

          <div className="summary-card">
            <div className="card-icon liabilities">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" />
                <path d="M1 10h22" />
              </svg>
            </div>
            <div className="card-content">
              <p className="card-label">Total Liabilities</p>
              <h2 className="card-value negative">${liabilities.toFixed(2)}</h2>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="networth-grid">
          {/* Breakdown Chart */}
          <div className="networth-card chart-card">
            <h3>Account Distribution</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">No accounts to display</div>
            )}
          </div>

          {/* Assets Breakdown */}
          <div className="networth-card">
            <h3>Assets</h3>
            <div className="account-breakdown">
              {checking.length > 0 && (
                <div className="breakdown-section">
                  <h4>Checking Accounts ({checking.length})</h4>
                  {checking.map(acc => (
                    <div key={acc._id} className="breakdown-item">
                      <span className="item-name">{acc.name}</span>
                      <span className="item-value positive">${acc.balances.current.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {savings.length > 0 && (
                <div className="breakdown-section">
                  <h4>Savings Accounts ({savings.length})</h4>
                  {savings.map(acc => (
                    <div key={acc._id} className="breakdown-item">
                      <span className="item-name">{acc.name}</span>
                      <span className="item-value positive">${acc.balances.current.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {investment.length > 0 && (
                <div className="breakdown-section">
                  <h4>Investment Accounts ({investment.length})</h4>
                  {investment.map(acc => (
                    <div key={acc._id} className="breakdown-item">
                      <span className="item-name">{acc.name}</span>
                      <span className="item-value positive">${acc.balances.current.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {checking.length === 0 && savings.length === 0 && investment.length === 0 && (
                <div className="empty-state">No asset accounts yet</div>
              )}
            </div>
          </div>

          {/* Liabilities Breakdown */}
          <div className="networth-card">
            <h3>Liabilities</h3>
            <div className="account-breakdown">
              {credit.length > 0 && (
                <div className="breakdown-section">
                  <h4>Credit Cards ({credit.length})</h4>
                  {credit.map(acc => (
                    <div key={acc._id} className="breakdown-item">
                      <span className="item-name">{acc.name}</span>
                      <span className="item-value negative">${Math.abs(acc.balances.current).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {other.filter(acc => acc.balances.current < 0).length > 0 && (
                <div className="breakdown-section">
                  <h4>Other Liabilities</h4>
                  {other.filter(acc => acc.balances.current < 0).map(acc => (
                    <div key={acc._id} className="breakdown-item">
                      <span className="item-name">{acc.name}</span>
                      <span className="item-value negative">${Math.abs(acc.balances.current).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {credit.length === 0 && other.filter(acc => acc.balances.current < 0).length === 0 && (
                <div className="empty-state">No liabilities - Great job!</div>
              )}
            </div>
          </div>
        </div>

        {/* Monthly Overview */}
        {summary && (
          <div className="networth-card monthly-overview">
            <h3>This Month Overview</h3>
            <div className="overview-grid">
              <div className="overview-item">
                <p className="overview-label">Income</p>
                <p className="overview-value positive">+${summary.this_month_income?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="overview-item">
                <p className="overview-label">Spending</p>
                <p className="overview-value negative">-${summary.this_month_spending?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="overview-item">
                <p className="overview-label">Net Change</p>
                <p className={`overview-value ${(summary.this_month_income - summary.this_month_spending) >= 0 ? 'positive' : 'negative'}`}>
                  {(summary.this_month_income - summary.this_month_spending) >= 0 ? '+' : ''}
                  ${((summary.this_month_income || 0) - (summary.this_month_spending || 0)).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NetWorth;
