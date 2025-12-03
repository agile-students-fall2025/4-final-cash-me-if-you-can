const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const {
  getBudgetStatus,
  createBudgetForChat,
  updateBudgetForChat,
} = require('../controllers/budgetController');

/**
 * Tool definitions for OpenAI function calling
 * These allow the chatbot to query user's financial data from MongoDB
 */

const tools = [
  {
    type: 'function',
    function: {
      name: 'get_spending_by_category',
      description: 'Get total spending amount for a specific category or all categories',
      parameters: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description: 'The spending category (e.g., "Groceries", "Transportation", "Dining"). Leave empty for all categories.',
          },
          days: {
            type: 'number',
            description: 'Number of days to look back (default: 30)',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_spending_trend',
      description: 'Get spending trend over time periods, comparing current period to previous period',
      parameters: {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            enum: ['week', 'month', 'quarter'],
            description: 'Time period for trend analysis',
          },
        },
        required: ['period'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_account_balance',
      description: 'Get current balance for user accounts',
      parameters: {
        type: 'object',
        properties: {
          account_type: {
            type: 'string',
            enum: ['checking', 'savings', 'credit', 'all'],
            description: 'Type of account to query',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_recent_transactions',
      description: 'Get recent transactions, optionally filtered by category',
      parameters: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description: 'Filter by category (optional)',
          },
          limit: {
            type: 'number',
            description: 'Number of transactions to return (default: 10)',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_budget',
      description: 'Create a new budget for a spending category. Use this when a user wants to set up a budget limit.',
      parameters: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description: 'The spending category for the budget (e.g., "Groceries", "Dining", "Entertainment")',
          },
          amount: {
            type: 'number',
            description: 'The budget limit amount in dollars',
          },
          period: {
            type: 'string',
            enum: ['weekly', 'monthly', 'yearly'],
            description: 'Budget period (default: monthly)',
          },
        },
        required: ['category', 'amount'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_budget_status',
      description: 'Check budget progress and spending status. Shows how much has been spent vs the budget limit.',
      parameters: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description: 'The budget category to check. Leave empty to see all budgets.',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_budget',
      description: 'Update an existing budget amount for a category',
      parameters: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description: 'The budget category to update',
          },
          new_amount: {
            type: 'number',
            description: 'The new budget limit amount in dollars',
          },
        },
        required: ['category', 'new_amount'],
      },
    },
  },
];

/**
 * Execute tool functions - all now query MongoDB
 */
const executeTool = {
  get_spending_by_category: async ({ category, days = 30 }, userId) => {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const query = {
        user_id: userId,
        date: { $gte: cutoffDate },
        amount: { $gt: 0 }, // Expenses are positive amounts
      };

      if (category) {
        query.category = { $in: [category] };
      }

      const transactions = await Transaction.find(query);

      if (category) {
        const total = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        return {
          category,
          total: total.toFixed(2),
          transaction_count: transactions.length,
          days,
        };
      } else {
        // Group by category
        const byCategory = {};
        transactions.forEach(t => {
          const cat = t.category && t.category.length > 0 ? t.category[0] : 'Uncategorized';
          if (!byCategory[cat]) {
            byCategory[cat] = { total: 0, count: 0 };
          }
          byCategory[cat].total += Math.abs(t.amount);
          byCategory[cat].count += 1;
        });

        return {
          categories: Object.entries(byCategory)
            .map(([name, data]) => ({
              category: name,
              total: data.total.toFixed(2),
              transaction_count: data.count,
            }))
            .sort((a, b) => parseFloat(b.total) - parseFloat(a.total)),
          days,
        };
      }
    } catch (err) {
      return { error: err.message };
    }
  },

  get_spending_trend: async ({ period }, userId) => {
    try {
      const now = new Date();
      let currentStart, previousStart, previousEnd;
      let periodDays;

      switch (period) {
        case 'week':
          periodDays = 7;
          currentStart = new Date(now);
          currentStart.setDate(now.getDate() - 7);
          previousStart = new Date(currentStart);
          previousStart.setDate(currentStart.getDate() - 7);
          previousEnd = currentStart;
          break;
        case 'quarter':
          periodDays = 90;
          currentStart = new Date(now);
          currentStart.setDate(now.getDate() - 90);
          previousStart = new Date(currentStart);
          previousStart.setDate(currentStart.getDate() - 90);
          previousEnd = currentStart;
          break;
        case 'month':
        default:
          periodDays = 30;
          currentStart = new Date(now);
          currentStart.setDate(now.getDate() - 30);
          previousStart = new Date(currentStart);
          previousStart.setDate(currentStart.getDate() - 30);
          previousEnd = currentStart;
          break;
      }

      // Get current period spending
      const currentTransactions = await Transaction.find({
        user_id: userId,
        date: { $gte: currentStart, $lte: now },
        amount: { $gt: 0 },
      });
      const currentSpending = currentTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

      // Get previous period spending
      const previousTransactions = await Transaction.find({
        user_id: userId,
        date: { $gte: previousStart, $lt: previousEnd },
        amount: { $gt: 0 },
      });
      const previousSpending = previousTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

      // Calculate trend
      let trend = 'stable';
      let percentChange = 0;
      if (previousSpending > 0) {
        percentChange = ((currentSpending - previousSpending) / previousSpending) * 100;
        if (percentChange > 10) trend = 'increasing';
        else if (percentChange < -10) trend = 'decreasing';
      }

      return {
        period,
        current_period_spending: currentSpending.toFixed(2),
        previous_period_spending: previousSpending.toFixed(2),
        percent_change: percentChange.toFixed(1),
        trend,
        message: trend === 'increasing'
          ? `Your spending is up ${Math.abs(percentChange).toFixed(0)}% compared to the previous ${period}.`
          : trend === 'decreasing'
            ? `Great job! Your spending is down ${Math.abs(percentChange).toFixed(0)}% compared to the previous ${period}.`
            : `Your spending over the past ${period} has been relatively stable.`,
      };
    } catch (err) {
      return { error: err.message };
    }
  },

  get_account_balance: async ({ account_type = 'all' }, userId) => {
    try {
      const query = { user_id: userId };

      if (account_type !== 'all') {
        query.subtype = account_type;
      }

      const accounts = await Account.find(query);

      if (accounts.length === 0) {
        return { message: 'No accounts found. Add accounts to track your balances.' };
      }

      if (account_type === 'all') {
        const totalBalance = accounts
          .filter(a => a.type !== 'credit')
          .reduce((sum, a) => sum + (a.balances?.current || 0), 0);
        const totalDebt = accounts
          .filter(a => a.type === 'credit')
          .reduce((sum, a) => sum + (a.balances?.current || 0), 0);

        return {
          accounts: accounts.map(acc => ({
            name: acc.name,
            type: acc.subtype || acc.type,
            balance: acc.balances?.current || 0,
          })),
          summary: {
            total_assets: totalBalance.toFixed(2),
            total_debt: totalDebt.toFixed(2),
            net_worth: (totalBalance - totalDebt).toFixed(2),
          },
        };
      } else {
        const account = accounts[0];
        return account
          ? {
              name: account.name,
              type: account.subtype || account.type,
              balance: account.balances?.current || 0,
            }
          : { error: 'Account not found' };
      }
    } catch (err) {
      return { error: err.message };
    }
  },

  get_recent_transactions: async ({ category, limit = 10 }, userId) => {
    try {
      const query = { user_id: userId };

      if (category) {
        query.category = { $in: [category] };
      }

      const transactions = await Transaction.find(query)
        .sort({ date: -1 })
        .limit(limit);

      if (transactions.length === 0) {
        return { message: 'No transactions found.' };
      }

      return {
        transactions: transactions.map(t => ({
          date: t.date.toISOString().split('T')[0],
          merchant: t.merchant_name || t.name,
          amount: t.amount,
          category: t.category && t.category.length > 0 ? t.category[0] : 'Uncategorized',
        })),
      };
    } catch (err) {
      return { error: err.message };
    }
  },

  // Budget tools
  create_budget: async ({ category, amount, period = 'monthly' }, userId) => {
    if (!userId) {
      return { error: 'User not authenticated' };
    }
    return await createBudgetForChat(userId, category, amount, period);
  },

  get_budget_status: async ({ category }, userId) => {
    if (!userId) {
      return { error: 'User not authenticated' };
    }
    return await getBudgetStatus(userId, category);
  },

  update_budget: async ({ category, new_amount }, userId) => {
    if (!userId) {
      return { error: 'User not authenticated' };
    }
    return await updateBudgetForChat(userId, category, new_amount);
  },
};

module.exports = { tools, executeTool };
