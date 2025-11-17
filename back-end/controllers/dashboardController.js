const mockTransactions = require('../data/mockTransactions.json');
const mockAccounts = require('../data/mockAccounts.json');
const { categorizeTransaction } = require('../utils/categorizer');

/**
 * Get dashboard summary
 */
const getSummary = async (req, res) => {
  try {
    // Calculate total balance across all accounts
    const totalBalance = mockAccounts.reduce((sum, acc) => {
      return sum + acc.balances.current;
    }, 0);

    // Get this month's transactions
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0];

    const thisMonthTransactions = mockTransactions.filter(
      t => t.date >= thisMonthStart && t.amount > 0
    );

    const thisMonthSpending = thisMonthTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    // Get last month's spending for comparison
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      .toISOString()
      .split('T')[0];
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
      .toISOString()
      .split('T')[0];

    const lastMonthTransactions = mockTransactions.filter(
      t => t.date >= lastMonthStart && t.date <= lastMonthEnd && t.amount > 0
    );

    const lastMonthSpending = lastMonthTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    const spendingChange =
      lastMonthSpending > 0
        ? ((thisMonthSpending - lastMonthSpending) / lastMonthSpending) * 100
        : 0;

    // Get income this month
    const thisMonthIncome = mockTransactions
      .filter(t => t.date >= thisMonthStart && t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Top spending categories this month
    const categorized = thisMonthTransactions.map(t => ({
      ...t,
      category: t.category?.[0] || categorizeTransaction(t),
    }));

    const categoryTotals = {};
    categorized.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const topCategories = Object.entries(categoryTotals)
      .map(([category, total]) => ({ category, total: parseFloat(total.toFixed(2)) }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    res.json({
      total_balance: parseFloat(totalBalance.toFixed(2)),
      this_month_spending: parseFloat(thisMonthSpending.toFixed(2)),
      this_month_income: parseFloat(thisMonthIncome.toFixed(2)),
      spending_change_percent: parseFloat(spendingChange.toFixed(1)),
      spending_trend: spendingChange > 0 ? 'up' : spendingChange < 0 ? 'down' : 'stable',
      top_categories: topCategories,
      accounts: mockAccounts.map(acc => ({
        name: acc.name,
        type: acc.subtype,
        balance: acc.balances.current,
      })),
    });
  } catch (error) {
    console.error('Error getting dashboard summary:', error);
    res.status(500).json({ error: 'Failed to get dashboard summary' });
  }
};

/**
 * Get spending over time period
 */
const getSpendingByPeriod = async (req, res) => {
  try {
    const { period = 'month' } = req.params;

    let groupedData = [];
    const now = new Date();

    if (period === 'week') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const dayTransactions = mockTransactions.filter(
          t => t.date === dateStr && t.amount > 0
        );

        const total = dayTransactions.reduce((sum, t) => sum + t.amount, 0);

        groupedData.push({
          date: dateStr,
          label: date.toLocaleDateString('en-US', { weekday: 'short' }),
          total: parseFloat(total.toFixed(2)),
          count: dayTransactions.length,
        });
      }
    } else if (period === 'month') {
      // Last 30 days grouped by week
      for (let i = 4; i >= 0; i--) {
        const weekEnd = new Date(now);
        weekEnd.setDate(weekEnd.getDate() - i * 7);
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekStart.getDate() - 6);

        const weekTransactions = mockTransactions.filter(t => {
          const tDate = new Date(t.date);
          return tDate >= weekStart && tDate <= weekEnd && t.amount > 0;
        });

        const total = weekTransactions.reduce((sum, t) => sum + t.amount, 0);

        groupedData.push({
          date: weekStart.toISOString().split('T')[0],
          label: `Week ${5 - i}`,
          total: parseFloat(total.toFixed(2)),
          count: weekTransactions.length,
        });
      }
    } else if (period === 'quarter') {
      // Last 3 months
      for (let i = 2; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = monthDate.toISOString().split('T')[0];
        const monthEnd = new Date(
          monthDate.getFullYear(),
          monthDate.getMonth() + 1,
          0
        )
          .toISOString()
          .split('T')[0];

        const monthTransactions = mockTransactions.filter(
          t => t.date >= monthStart && t.date <= monthEnd && t.amount > 0
        );

        const total = monthTransactions.reduce((sum, t) => sum + t.amount, 0);

        groupedData.push({
          date: monthStart,
          label: monthDate.toLocaleDateString('en-US', { month: 'short' }),
          total: parseFloat(total.toFixed(2)),
          count: monthTransactions.length,
        });
      }
    } else if (period === 'year') {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = monthDate.toISOString().split('T')[0];
        const monthEnd = new Date(
          monthDate.getFullYear(),
          monthDate.getMonth() + 1,
          0
        )
          .toISOString()
          .split('T')[0];

        const monthTransactions = mockTransactions.filter(
          t => t.date >= monthStart && t.date <= monthEnd && t.amount > 0
        );

        const total = monthTransactions.reduce((sum, t) => sum + t.amount, 0);

        groupedData.push({
          date: monthStart,
          label: monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          total: parseFloat(total.toFixed(2)),
          count: monthTransactions.length,
        });
      }
    }

    // Calculate average and total
    const totalSpending = groupedData.reduce((sum, d) => sum + d.total, 0);
    const averageSpending = totalSpending / groupedData.length;

    res.json({
      period,
      data: groupedData,
      total_spending: parseFloat(totalSpending.toFixed(2)),
      average_spending: parseFloat(averageSpending.toFixed(2)),
    });
  } catch (error) {
    console.error('Error getting spending by period:', error);
    res.status(500).json({ error: 'Failed to get spending data' });
  }
};

/**
 * Get category breakdown
 */
const getCategoryBreakdown = async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    // Determine date range
    const now = new Date();
    let startDate;

    if (period === 'week') {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'quarter') {
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 3);
    } else {
      startDate = new Date(now);
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const startDateStr = startDate.toISOString().split('T')[0];

    // Filter transactions
    const periodTransactions = mockTransactions.filter(
      t => t.date >= startDateStr && t.amount > 0
    );

    // Categorize and group
    const categorized = periodTransactions.map(t => ({
      ...t,
      category: t.category?.[0] || categorizeTransaction(t),
    }));

    const categoryData = {};
    categorized.forEach(t => {
      if (!categoryData[t.category]) {
        categoryData[t.category] = { total: 0, count: 0 };
      }
      categoryData[t.category].total += t.amount;
      categoryData[t.category].count += 1;
    });

    // Convert to array with percentages
    const totalSpending = Object.values(categoryData).reduce(
      (sum, c) => sum + c.total,
      0
    );

    const breakdown = Object.entries(categoryData)
      .map(([category, data]) => ({
        category,
        total: parseFloat(data.total.toFixed(2)),
        count: data.count,
        percentage: parseFloat(((data.total / totalSpending) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.total - a.total);

    res.json({
      period,
      categories: breakdown,
      total_spending: parseFloat(totalSpending.toFixed(2)),
    });
  } catch (error) {
    console.error('Error getting category breakdown:', error);
    res.status(500).json({ error: 'Failed to get category breakdown' });
  }
};

module.exports = {
  getSummary,
  getSpendingByPeriod,
  getCategoryBreakdown,
};
