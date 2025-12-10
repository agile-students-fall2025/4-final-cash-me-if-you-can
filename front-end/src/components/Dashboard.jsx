import React, { useState, useEffect } from 'react';
import { Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, ComposedChart, Cell, PieChart, Pie, BarChart, Bar, Legend } from 'recharts';
import './Dashboard.css';
import { dashboardAPI } from '../services/api';
import budgetConfigData from '../data/budgetConfig.json';

const TIME_PERIODS = {
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year'
};

const getBudgetForPeriod = (period) => {
  return budgetConfigData.budgets[period] || budgetConfigData.budgets.month;
};

function Dashboard() {
  const [timePeriod, setTimePeriod] = useState(TIME_PERIODS.MONTH);
  const [spendingData, setSpendingData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData(timePeriod);
  }, [timePeriod]);

  const fetchAllData = async (period) => {
    setLoading(true);
    try {
      const [spendingResponse, summaryResponse, categoryResponse, comparisonResponse] = await Promise.all([
        dashboardAPI.getSpendingByPeriod(period),
        dashboardAPI.getSummary(),
        dashboardAPI.getCategoryBreakdown(period),
        dashboardAPI.getMonthlyComparison()
      ]);

      // Transform spending data for chart
      let cumulative = 0;
      const chartData = Array.isArray(spendingResponse?.data)
        ? spendingResponse.data.map(item => {
            cumulative += item.total;
            return {
              amount: cumulative,
              date: item.label
            };
          })
        : [];

      setSpendingData(chartData);
      setSummary(summaryResponse);
      setCategoryData(Array.isArray(categoryResponse?.categories) ? categoryResponse.categories.slice(0, 5) : []);
      setComparisonData(comparisonResponse);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setSpendingData([]);
      setSummary(null);
      setCategoryData([]);
      setComparisonData(null);
    } finally {
      setLoading(false);
    }
  };

  const currentSpend = spendingData.length > 0 ? spendingData[spendingData.length - 1].amount : 0;
  const budget = getBudgetForPeriod(timePeriod);

  const getPeriodLabel = () => {
    const labels = { week: 'this week', month: 'this month', quarter: 'this quarter', year: 'this year' };
    return labels[timePeriod] || 'this month';
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-date">{payload[0].payload.date}</p>
          <p className="tooltip-amount">${payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  const CATEGORY_COLORS = [
    '#10b981', '#f59e0b', '#84cc16', '#3b82f6', '#ec4899',
    '#8b5cf6', '#06b6d4', '#f43f5e', '#14b8a6', '#a855f7'
  ];

  if (loading) {
    return <div className="dashboard-container"><div className="loading-state">Loading dashboard...</div></div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Your complete financial overview</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon balance">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="card-content">
            <p className="card-label">Total Balance</p>
            <h2 className="card-value">${summary?.total_balance?.toFixed(2) || '0.00'}</h2>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon income">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </div>
          <div className="card-content">
            <p className="card-label">This Month Income</p>
            <h2 className="card-value income">${summary?.this_month_income?.toFixed(2) || '0.00'}</h2>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon expense">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </div>
          <div className="card-content">
            <p className="card-label">This Month Spending</p>
            <h2 className="card-value expense">${summary?.this_month_spending?.toFixed(2) || '0.00'}</h2>
            {summary?.spending_change_percent !== undefined && (
              <p className={`card-change ${summary.spending_trend}`}>
                {summary.spending_trend === 'up' ? '↑' : summary.spending_trend === 'down' ? '↓' : '→'}
                {Math.abs(summary.spending_change_percent).toFixed(1)}% vs last month
              </p>
            )}
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon net">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path d="M9 10h6M9 14h6" />
            </svg>
          </div>
          <div className="card-content">
            <p className="card-label">Net This Month</p>
            <h2 className={`card-value ${(summary?.this_month_income || 0) - (summary?.this_month_spending || 0) >= 0 ? 'income' : 'expense'}`}>
              ${((summary?.this_month_income || 0) - (summary?.this_month_spending || 0)).toFixed(2)}
            </h2>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Spending Over Time */}
        <div className="dashboard-card spending-chart-card">
          <div className="card-header">
            <h3>Spending Over Time</h3>
            <div className="time-period-selector">
              {Object.entries(TIME_PERIODS).map(([key, value]) => (
                <button
                  key={value}
                  className={`period-btn ${timePeriod === value ? 'active' : ''}`}
                  onClick={() => setTimePeriod(value)}
                >
                  {key.charAt(0) + key.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="spending-info">
            <h2 className="spending-amount">${currentSpend.toFixed(2)}</h2>
            <p className="spending-label">{getPeriodLabel()}</p>
          </div>

          <div className="chart-container">
            <div className="budget-label">BUDGET</div>
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={spendingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="#444"
                  tick={{ fill: '#666', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#444"
                  tick={{ fill: '#666', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="amount" fill="url(#colorGradient)" stroke="none" />
                <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#6366f1' }} />
                <Line type="monotone" dataKey={() => budget} stroke="#444" strokeWidth={1} strokeDasharray="5 5" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Categories */}
        <div className="dashboard-card categories-card">
          <div className="card-header">
            <h3>Top Spending Categories</h3>
            <p className="card-subtitle">{getPeriodLabel()}</p>
          </div>

          <div className="categories-list">
            {categoryData.length > 0 ? (
              categoryData.map((cat, index) => (
                <div key={index} className="category-item">
                  <div className="category-info">
                    <div
                      className="category-color"
                      style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                    />
                    <span className="category-name">{cat.category}</span>
                  </div>
                  <div className="category-stats">
                    <span className="category-amount">${cat.total.toFixed(2)}</span>
                    <span className="category-percentage">{cat.percentage}%</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">No spending data yet</div>
            )}
          </div>
        </div>

        {/* Monthly Comparison */}
        <div className="dashboard-card comparison-card">
          <div className="card-header">
            <h3>Monthly Comparison</h3>
            <p className="card-subtitle">
              {comparisonData?.thisMonth?.name || 'This Month'} vs {comparisonData?.lastMonth?.name || 'Last Month'}
            </p>
          </div>

          {comparisonData && comparisonData.thisMonth && comparisonData.lastMonth ? (
            <>
              <div className="chart-container comparison-chart">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={comparisonData.thisMonth.weeks.map((w, i) => ({
                      week: w.week,
                      thisMonth: w.amount,
                      lastMonth: comparisonData.lastMonth.weeks[i]?.amount || 0
                    }))}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="week"
                      stroke="#444"
                      tick={{ fill: '#666', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#444"
                      tick={{ fill: '#666', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#000',
                        border: '1px solid #333',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => [`$${value.toFixed(2)}`, '']}
                      labelStyle={{ color: '#888' }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: '10px' }}
                      formatter={(value) => <span style={{ color: '#888', fontSize: '12px' }}>{value}</span>}
                    />
                    <Bar dataKey="thisMonth" fill="#22d3ee" name="This Month" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="lastMonth" fill="#8b5cf6" name="Last Month" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="comparison-summary">
                <div className="comparison-totals">
                  <div className="comparison-total">
                    <span className="total-label">This Month</span>
                    <span className="total-value this-month">${comparisonData.thisMonth.total.toFixed(2)}</span>
                  </div>
                  <div className="comparison-total">
                    <span className="total-label">Last Month</span>
                    <span className="total-value last-month">${comparisonData.lastMonth.total.toFixed(2)}</span>
                  </div>
                </div>
                <div className={`comparison-change ${comparisonData.trend === 'up' ? 'negative' : comparisonData.trend === 'down' ? 'positive' : ''}`}>
                  {comparisonData.trend === 'up' ? '↑' : comparisonData.trend === 'down' ? '↓' : '→'}
                  {Math.abs(comparisonData.percentChange).toFixed(1)}% vs last month
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">No comparison data available</div>
          )}
        </div>

        {/* Accounts */}
        <div className="dashboard-card accounts-card">
          <div className="card-header">
            <h3>Accounts</h3>
            <p className="card-subtitle">{summary?.accounts?.length || 0} accounts</p>
          </div>

          <div className="accounts-list">
            {summary?.accounts && summary.accounts.length > 0 ? (
              summary.accounts.map((account, index) => (
                <div key={index} className="account-item">
                  <div className="account-info">
                    <div className="account-icon">
                      {account.type === 'credit' ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="1" y="4" width="22" height="16" rx="2" />
                          <path d="M1 10h22" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="account-name">{account.name}</p>
                      <p className="account-type">{account.type}</p>
                    </div>
                  </div>
                  <p className={`account-balance ${account.balance < 0 ? 'negative' : ''}`}>
                    ${Math.abs(account.balance).toFixed(2)}
                  </p>
                </div>
              ))
            ) : (
              <div className="empty-state">No accounts added yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
