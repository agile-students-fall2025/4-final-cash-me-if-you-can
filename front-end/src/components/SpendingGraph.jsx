import React, { useState, useEffect } from 'react';
import { Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, ComposedChart } from 'recharts';
import './SpendingGraph.css';
import Header from './Header';
import Accounts from './Accounts.jsx';
import budgetConfigData from '../data/budgetConfig.json';
import { dashboardAPI } from '../services/api';

const TIME_PERIODS = {
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year'
};

const getBudgetForPeriod = (period) => {
  return budgetConfigData.budgets[period] || budgetConfigData.budgets.month;
};

function SpendingGraph() {
  const [timePeriod, setTimePeriod] = useState(TIME_PERIODS.MONTH);
  const [spendingData, setSpendingData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpendingData(timePeriod);
  }, [timePeriod]);

  const fetchSpendingData = async (period) => {
    setLoading(true);
    try {
      const response = await dashboardAPI.getSpendingByPeriod(period);
      // Transform data for chart - make cumulative
      let cumulative = 0;
      const chartData = response.data.map(item => {
        cumulative += item.total;
        return {
          amount: cumulative,
          date: item.label
        };
      });
      setSpendingData(chartData);
    } catch (error) {
      console.error('Error fetching spending data:', error);
      // Fallback to empty data
      setSpendingData([]);
    } finally {
      setLoading(false);
    }
  };

  const currentSpend = spendingData.length > 0 ? spendingData[spendingData.length - 1].amount : 0;
  const budget = getBudgetForPeriod(timePeriod);

  const handlePeriodChange = (period) => {
    setTimePeriod(period);
  };

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

  return (
    <div className="spending-graph-container">
      <Header title="Dashboard" subtitle="Track your spending and budget" />
      <div className="dashboard-content">
        <div className="time-period-selector">
        {Object.entries(TIME_PERIODS).map(([key, value]) => (
          <button 
            key={value}
            className={`period-btn ${timePeriod === value ? 'active' : ''}`}
            onClick={() => handlePeriodChange(value)}
          >
            {key.charAt(0) + key.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="spending-header">
        <div className="spending-info">
          <p className="spending-label">Current spend {getPeriodLabel()}</p>
          <h2 className="spending-amount">${currentSpend.toFixed(2)}</h2>
        </div>
      </div>

      <div className="chart-container">
        <div className="budget-label">BUDGET</div>
        <ResponsiveContainer width="100%" height={200}>
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
      <Accounts />
      </div>
    </div>
  );
}

export default SpendingGraph;