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
 * Transaction API calls
 */
export const transactionAPI = {
  getTransactions: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/transactions?${queryString}`);
    return response.json();
  },

  categorizeAll: async () => {
    const response = await fetch(`${API_BASE_URL}/transactions/categorize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  },

  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/transactions/categories`);
    return response.json();
  },

  createCategory: async (name) => {
    const response = await fetch(`${API_BASE_URL}/transactions/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    return response.json();
  },

  updateCategory: async (transactionId, category) => {
    const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}/category`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category }),
    });
    return response.json();
  },

  getSpendingByCategory: async (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const response = await fetch(`${API_BASE_URL}/transactions/by-category?${params}`);
    return response.json();
  },

  getSuggestions: async (merchant) => {
    const response = await fetch(`${API_BASE_URL}/transactions/suggest-category?merchant=${merchant}`);
    return response.json();
  },
};

/**
 * Dashboard API calls
 */
export const dashboardAPI = {
  getSummary: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/summary`);
    return response.json();
  },

  getSpendingByPeriod: async (period = 'month') => {
    const response = await fetch(`${API_BASE_URL}/dashboard/spending/${period}`);
    return response.json();
  },

  getCategoryBreakdown: async (period = 'month') => {
    const response = await fetch(`${API_BASE_URL}/dashboard/categories?period=${period}`);
    return response.json();
  },
};

/**
 * Chatbot API calls
 */
export const chatAPI = {
  sendMessage: async (message, userId = 'default') => {
    const response = await fetch(`${API_BASE_URL}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, user_id: userId }),
    });
    return response.json();
  },

  getHistory: async (userId = 'default') => {
    const response = await fetch(`${API_BASE_URL}/chat/history?user_id=${userId}`);
    return response.json();
  },

  clearHistory: async (userId = 'default') => {
    const response = await fetch(`${API_BASE_URL}/chat/clear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    });
    return response.json();
  },
};
