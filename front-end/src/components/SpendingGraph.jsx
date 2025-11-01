import React, { useState } from 'react';
import { Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, ComposedChart } from 'recharts';
import './SpendingGraph.css';
import Accounts from './Accounts.jsx';
import budgetConfigData from '../data/budgetConfig.json';

const TIME_PERIODS = {
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year'
};

const generateSpendingData = (period) => {
  const data = [];
  let cumulative = 0;

  const config = budgetConfigData.timePeriods[period];

  if (period === TIME_PERIODS.YEAR) {
    config.months.forEach((month, index) => {
      cumulative += (Math.random() * 120 + 60) * 30;
      data.push({
        amount: parseFloat(cumulative.toFixed(2)),
        date: month
      });
    });
  } else {
    for (let day = 1; day <= config.days; day++) {
      cumulative += Math.random() * config.dailyAvg + (config.dailyAvg * 0.5);
      let dateLabel = period === TIME_PERIODS.WEEK ? config.labels[day - 1] : 
                      period === TIME_PERIODS.QUARTER ? `Day ${day}` : `Oct ${day}`;
      
      data.push({
        amount: parseFloat(cumulative.toFixed(2)),
        date: dateLabel
      });
    }
  }
  
  return data;
};

const getBudgetForPeriod = (period) => {
  return budgetConfigData.budgets[period] || budgetConfigData.budgets.month;
};

function SpendingGraph() {
  const [timePeriod, setTimePeriod] = useState(TIME_PERIODS.MONTH);
  const [spendingData, setSpendingData] = useState(generateSpendingData(TIME_PERIODS.MONTH));
  
  const currentSpend = spendingData[spendingData.length - 1].amount;
  const budget = getBudgetForPeriod(timePeriod);

  const handlePeriodChange = (period) => {
    setTimePeriod(period);
    setSpendingData(generateSpendingData(period));
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
  );
}

export default SpendingGraph;