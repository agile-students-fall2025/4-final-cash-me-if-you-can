const mockTransactions = require('../data/mockTransactions.json');
const mockAccounts = require('../data/mockAccounts.json');

/**
 * Tool definitions for OpenAI function calling
 * These allow the chatbot to query user's financial data
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
      description: 'Get spending trend over time periods',
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
];

/**
 * Execute tool functions
 */
const executeTool = {
  get_spending_by_category: ({ category, days = 30 }) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    // Expenses are negative amounts in the mock data
    let filteredTransactions = mockTransactions.filter(
      t => t.amount < 0 && t.date >= cutoffStr
    );

    if (category) {
      filteredTransactions = filteredTransactions.filter(
        t => t.category && t.category[0] === category
      );

      // Use Math.abs since amounts are negative
      const total = filteredTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      return {
        category,
        total: total.toFixed(2),
        transaction_count: filteredTransactions.length,
        days,
      };
    } else {
      // Group by category
      const byCategory = {};
      filteredTransactions.forEach(t => {
        const cat = t.category ? t.category[0] : 'Uncategorized';
        if (!byCategory[cat]) {
          byCategory[cat] = { total: 0, count: 0 };
        }
        byCategory[cat].total += Math.abs(t.amount);
        byCategory[cat].count += 1;
      });

      return {
        categories: Object.entries(byCategory).map(([name, data]) => ({
          category: name,
          total: data.total.toFixed(2),
          transaction_count: data.count,
        })),
        days,
      };
    }
  },

  get_spending_trend: ({ period }) => {
    // Simplified trend - in production would calculate actual trends
    // Expenses are negative amounts in the mock data
    const totalSpending = mockTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      period,
      current_period_spending: totalSpending.toFixed(2),
      trend: 'stable',
      message: `Your spending over the past ${period} has been relatively stable.`,
    };
  },

  get_account_balance: ({ account_type = 'all' }) => {
    if (account_type === 'all') {
      return {
        accounts: mockAccounts.map(acc => ({
          name: acc.name,
          type: acc.subtype,
          balance: acc.balances.current,
        })),
      };
    } else {
      const account = mockAccounts.find(acc => acc.subtype === account_type);
      return account
        ? {
            name: account.name,
            type: account.subtype,
            balance: account.balances.current,
          }
        : { error: 'Account not found' };
    }
  },

  get_recent_transactions: ({ category, limit = 10 }) => {
    let transactions = [...mockTransactions].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    if (category) {
      transactions = transactions.filter(
        t => t.category && t.category[0] === category
      );
    }

    return {
      transactions: transactions.slice(0, limit).map(t => ({
        date: t.date,
        merchant: t.name,
        amount: t.amount,
        category: t.category ? t.category[0] : 'Uncategorized',
      })),
    };
  },
};

module.exports = { tools, executeTool };
