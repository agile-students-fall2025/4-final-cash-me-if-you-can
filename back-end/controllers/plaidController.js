const plaidClient = require('../config/plaid');
const { CountryCode, Products } = require('plaid');
const mockAccounts = require('../data/mockAccounts.json');
const mockTransactions = require('../data/mockTransactions.json');
const { seedMockDataForUser, isDemoMode } = require('../utils/seedMockData');

// Store access tokens temporarily (use database in production)
let accessTokens = {};

const handlePlaidError = (error, res) => {
  console.error('Plaid API Error:', {
    error_type: error.error_type,
    error_code: error.error_code,
    error_message: error.error_message,
    display_message: error.display_message
  });

  const statusCode = error.status_code || 500;

  return res.status(statusCode).json({
    error: error.error_type || 'PLAID_ERROR',
    error_code: error.error_code,
    message: error.display_message || error.error_message || 'An error occurred with Plaid',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

// Create Link Token
const createLinkToken = async (req, res) => {
  try {
    const user_id = req.body.user_id || 'user-' + Date.now();

    // In demo mode, return mock link token
    if (isDemoMode()) {
      console.log('[DEMO MODE] Creating mock link token for user:', user_id);
      return res.json({
        link_token: 'link-sandbox-mock-token-' + Date.now(),
        expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        request_id: 'mock-request-' + Date.now()
      });
    }

    console.log('Creating Plaid link token for user:', user_id);
    const request = {
      user: {
        client_user_id: user_id,
      },
      client_name: 'Cash Me If You Can',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
      webhook: process.env.PLAID_WEBHOOK_URL,
    };

    const response = await plaidClient.linkTokenCreate(request);
    console.log('Link token created successfully');
    res.json(response.data);
  } catch (error) {
    if (error.response && error.response.data) {
      return handlePlaidError(error.response.data, res);
    }
    console.error('Error creating link token:', error.message);
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Failed to create link token',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Exchange Public Token
const exchangePublicToken = async (req, res) => {
  try {
    const { public_token } = req.body;

    if (!public_token) {
      return res.status(400).json({
        error: 'MISSING_PARAMETER',
        message: 'public_token is required'
      });
    }

    // In demo mode, return mock access token and seed data for user
    if (isDemoMode()) {
      console.log('[DEMO MODE] Exchanging mock public token');
      const userId = req.body.user_id || '673e8d9a5e9e123456789abc';
      const mockAccessToken = 'access-sandbox-mock-token-' + Date.now();
      accessTokens[mockAccessToken] = {
        item_id: 'item-mock-' + Date.now(),
        created_at: new Date().toISOString(),
        user_id: userId
      };

      // Seed mock data into MongoDB for this user
      await seedMockDataForUser(userId);

      return res.json({
        access_token: mockAccessToken,
        item_id: accessTokens[mockAccessToken].item_id,
        request_id: 'mock-request-' + Date.now()
      });
    }

    console.log('Exchanging public token for access token');
    const response = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    const { access_token, item_id } = response.data;

    accessTokens[access_token] = {
      item_id,
      created_at: new Date().toISOString(),
      user_id: req.body.user_id || '673e8d9a5e9e123456789abc'
    };

    console.log('Token exchanged successfully, item_id:', item_id);
    res.json({ access_token, item_id, request_id: response.data.request_id });
  } catch (error) {
    if (error.response && error.response.data) {
      return handlePlaidError(error.response.data, res);
    }
    console.error('Error exchanging public token:', error.message);
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Failed to exchange public token',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get Accounts
const getAccounts = async (req, res) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({
        error: 'MISSING_PARAMETER',
        message: 'access_token is required'
      });
    }

    // In demo mode, return mock accounts
    if (isDemoMode()) {
      console.log('[DEMO MODE] Fetching mock accounts');
      return res.json({
        accounts: mockAccounts,
        item: {
          institution_id: 'ins_mock',
          item_id: 'item-mock-001'
        },
        request_id: 'mock-request-' + Date.now()
      });
    }

    console.log('Fetching accounts from Plaid');
    const response = await plaidClient.accountsGet({
      access_token,
    });

    console.log('Accounts fetched successfully, count:', response.data.accounts.length);
    res.json(response.data);
  } catch (error) {
    if (error.response && error.response.data) {
      return handlePlaidError(error.response.data, res);
    }
    console.error('Error getting accounts:', error.message);
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Failed to retrieve accounts',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get Transactions
const getTransactions = async (req, res) => {
  try {
    const { access_token, start_date, end_date } = req.body;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    if (!access_token) {
      return res.status(400).json({
        error: 'MISSING_PARAMETER',
        message: 'access_token is required'
      });
    }

    const defaultEndDate = new Date().toISOString().split('T')[0];
    const defaultStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const startDate = start_date || defaultStartDate;
    const endDate = end_date || defaultEndDate;

    if (isDemoMode()) {
      console.log(`[DEMO MODE] Fetching mock transactions from ${startDate} to ${endDate}`);
      let transactions = [...mockTransactions];

      transactions = transactions.filter(t => t.date >= startDate && t.date <= endDate);

      transactions.sort((a, b) => new Date(b.date) - new Date(a.date));


      const total = transactions.length;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;
      const paginatedTransactions = transactions.slice(offset, offset + limit);

      return res.json({
        transactions: paginatedTransactions,
        accounts: mockAccounts,
        total_transactions: total,
        pagination: {
          current_page: page,
          total_pages: totalPages,
          page_size: limit,
          has_more: page < totalPages
        },
        request_id: 'mock-request-' + Date.now()
      });
    }

    console.log(`Fetching transactions from Plaid (${startDate} to ${endDate})`);
    const response = await plaidClient.transactionsGet({
      access_token,
      start_date: startDate,
      end_date: endDate,
      options: {
        count: limit,
        offset: (page - 1) * limit
      }
    });

    console.log('Transactions fetched successfully, count:', response.data.transactions.length);

    const total = response.data.total_transactions;
    const totalPages = Math.ceil(total / limit);

    res.json({
      ...response.data,
      pagination: {
        current_page: page,
        total_pages: totalPages,
        page_size: limit,
        has_more: page < totalPages
      }
    });
  } catch (error) {
    if (error.response && error.response.data) {
      return handlePlaidError(error.response.data, res);
    }
    console.error('Error getting transactions:', error.message);
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Failed to retrieve transactions',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createLinkToken,
  exchangePublicToken,
  getAccounts,
  getTransactions,
};
