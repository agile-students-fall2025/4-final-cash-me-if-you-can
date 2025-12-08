const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

/**
 * Plaid API calls
 */
export const plaidAPI = {
  createLinkToken: async (userId = 'default') => {
    const response = await fetch(`${API_BASE_URL}/plaid/create_link_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    });
    return response.json();
  },

  exchangePublicToken: async (publicToken) => {
    const response = await fetch(`${API_BASE_URL}/plaid/exchange_public_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_token: publicToken }),
    });
    return response.json();
  },

  getAccounts: async (accessToken) => {
    const response = await fetch(`${API_BASE_URL}/plaid/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: accessToken }),
    });
    return response.json();
  },

  getTransactions: async (accessToken, startDate, endDate) => {
    const response = await fetch(`${API_BASE_URL}/plaid/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: accessToken, start_date: startDate, end_date: endDate }),
    });
    return response.json();
  },
};

/**
 * Account API calls
 */
export const accountAPI = {
  getAccounts: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/accounts`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getAccountById: async (accountId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/accounts/${accountId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  createAccount: async (accountData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(accountData),
    });
    return response.json();
  },

  updateAccount: async (accountId, accountData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/accounts/${accountId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(accountData),
    });
    return response.json();
  },

  deleteAccount: async (accountId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/accounts/${accountId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
};

/**
 * Transaction API calls
 */
export const transactionAPI = {
  getTransactions: async (params = {}) => {
    const token = localStorage.getItem('token');
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/transactions?${queryString}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  createTransaction: async (transactionData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(transactionData),
    });
    return response.json();
  },

  updateTransaction: async (transactionId, transactionData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(transactionData),
    });
    return response.json();
  },

  deleteTransaction: async (transactionId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  categorizeAll: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/transactions/categorize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getCategories: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/transactions/categories`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  createCategory: async (name) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/transactions/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });
    return response.json();
  },

  updateCategory: async (transactionId, category) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}/category`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ category }),
    });
    return response.json();
  },

  getSpendingByCategory: async (startDate, endDate) => {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const response = await fetch(`${API_BASE_URL}/transactions/by-category?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getSuggestions: async (merchant) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/transactions/suggest-category?merchant=${merchant}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
};

/**
 * Dashboard API calls
 */
export const dashboardAPI = {
  getSummary: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/dashboard/summary`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getSpendingByPeriod: async (period = 'month') => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/dashboard/spending/${period}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getCategoryBreakdown: async (period = 'month') => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/dashboard/categories?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
};

/**
 * Recurring Transactions API calls
 */
export const recurringTransactionAPI = {
  getRecurringTransactions: async () => {
    const response = await fetch(`${API_BASE_URL}/recurring-transactions`);
    return response.json();
  },

  getRecurringTransactionById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/recurring-transactions/${id}`);
    return response.json();
  },

  createRecurringTransaction: async (data) => {
    const response = await fetch(`${API_BASE_URL}/recurring-transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  updateRecurringTransaction: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/recurring-transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  deleteRecurringTransaction: async (id) => {
    const response = await fetch(`${API_BASE_URL}/recurring-transactions/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  processDueRecurringTransactions: async () => {
    const response = await fetch(`${API_BASE_URL}/recurring-transactions/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  },
};

/**
 * Chatbot API calls
 */
export const chatAPI = {
  sendMessage: async (message) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    });
    return response.json();
  },

  getHistory: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/chat/history`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  clearHistory: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/chat/clear`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
};
