const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const { categorizeTransaction } = require('../utils/categorizer');

const DEFAULT_USER_ID = '673e8d9a5e9e123456789abc';

const getSummary = async (req, res) => {
  try {
    const userId = req.user?.id || DEFAULT_USER_ID;

    const accounts = await Account.find({ user_id: userId });
    const totalBalance = accounts.reduce((sum, acc) => {
      return sum + (acc.balances.current || 0);
    }, 0);

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthTransactions = await Transaction.find({
      user_id: userId,
      date: { $gte: thisMonthStart },
      amount: { $gt: 0 },
    });

    const thisMonthSpending = thisMonthTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const lastMonthTransactions = await Transaction.find({
      user_id: userId,
      date: { $gte: lastMonthStart, $lte: lastMonthEnd },
      amount: { $gt: 0 },
    });

    const lastMonthSpending = lastMonthTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    const spendingChange =
      lastMonthSpending > 0
        ? ((thisMonthSpending - lastMonthSpending) / lastMonthSpending) * 100
        : 0;

    const thisMonthIncome = await Transaction.aggregate([
      {
        $match: {
          user_id: userId,
          date: { $gte: thisMonthStart },
          amount: { $lt: 0 },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $abs: '$amount' } },
        },
      },
    ]);

    const incomeAmount = thisMonthIncome.length > 0 ? thisMonthIncome[0].total : 0;

    const categoryTotals = {};
    thisMonthTransactions.forEach(t => {
      const category = t.category && t.category.length > 0 ? t.category[0] : 'Uncategorized';
      categoryTotals[category] = (categoryTotals[category] || 0) + t.amount;
    });

    const topCategories = Object.entries(categoryTotals)
      .map(([category, total]) => ({ category, total: parseFloat(total.toFixed(2)) }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    res.json({
      total_balance: parseFloat(totalBalance.toFixed(2)),
      this_month_spending: parseFloat(thisMonthSpending.toFixed(2)),
      this_month_income: parseFloat(incomeAmount.toFixed(2)),
      spending_change_percent: parseFloat(spendingChange.toFixed(1)),
      spending_trend: spendingChange > 0 ? 'up' : spendingChange < 0 ? 'down' : 'stable',
      top_categories: topCategories,
      accounts: accounts.map(acc => ({
        name: acc.name,
        type: acc.subtype,
        balance: acc.balances.current || 0,
      })),
    });
  } catch (error) {
    console.error('Error getting dashboard summary:', error);
    res.status(500).json({ error: 'Failed to get dashboard summary' });
  }
};

const getSpendingByPeriod = async (req, res) => {
  try {
    const userId = req.user?.id || DEFAULT_USER_ID;
    const { period = 'month' } = req.params;

    let groupedData = [];
    const now = new Date();

    if (period === 'week') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));

        const dayTransactions = await Transaction.find({
          user_id: userId,
          date: { $gte: startOfDay, $lte: endOfDay },
          amount: { $gt: 0 },
        });

        const total = dayTransactions.reduce((sum, t) => sum + t.amount, 0);

        groupedData.push({
          date: startOfDay.toISOString().split('T')[0],
          label: startOfDay.toLocaleDateString('en-US', { weekday: 'short' }),
          total: parseFloat(total.toFixed(2)),
          count: dayTransactions.length,
        });
      }
    } else if (period === 'month') {
      for (let i = 4; i >= 0; i--) {
        const weekEnd = new Date(now);
        weekEnd.setDate(weekEnd.getDate() - i * 7);
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekStart.getDate() - 6);

        const weekTransactions = await Transaction.find({
          user_id: userId,
          date: { $gte: weekStart, $lte: weekEnd },
          amount: { $gt: 0 },
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
      for (let i = 2; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

        const monthTransactions = await Transaction.find({
          user_id: userId,
          date: { $gte: monthDate, $lte: monthEnd },
          amount: { $gt: 0 },
        });

        const total = monthTransactions.reduce((sum, t) => sum + t.amount, 0);

        groupedData.push({
          date: monthDate.toISOString().split('T')[0],
          label: monthDate.toLocaleDateString('en-US', { month: 'short' }),
          total: parseFloat(total.toFixed(2)),
          count: monthTransactions.length,
        });
      }
    } else if (period === 'year') {
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

        const monthTransactions = await Transaction.find({
          user_id: userId,
          date: { $gte: monthDate, $lte: monthEnd },
          amount: { $gt: 0 },
        });

        const total = monthTransactions.reduce((sum, t) => sum + t.amount, 0);

        groupedData.push({
          date: monthDate.toISOString().split('T')[0],
          label: monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          total: parseFloat(total.toFixed(2)),
          count: monthTransactions.length,
        });
      }
    }

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

const getCategoryBreakdown = async (req, res) => {
  try {
    const userId = req.user?.id || DEFAULT_USER_ID;
    const { period = 'month' } = req.query;

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

    const periodTransactions = await Transaction.find({
      user_id: userId,
      date: { $gte: startDate },
      amount: { $gt: 0 },
    });

    const categoryData = {};
    periodTransactions.forEach(t => {
      const category = t.category && t.category.length > 0 ? t.category[0] : 'Uncategorized';

      if (!categoryData[category]) {
        categoryData[category] = { total: 0, count: 0 };
      }
      categoryData[category].total += t.amount;
      categoryData[category].count += 1;
    });

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
