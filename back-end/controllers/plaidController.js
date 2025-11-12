const plaidClient = require('../config/plaid');
const { CountryCode, Products } = require('plaid');
const mockAccounts = require('../data/mockAccounts.json');
const mockTransactions = require('../data/mockTransactions.json');

// Store access tokens temporarily (use database in production)
let accessTokens = {};

// Create Link Token
const createLinkToken = async (req, res) => {
  try {
    // In demo mode, return mock link token
    if (!process.env.PLAID_CLIENT_ID || process.env.PLAID_CLIENT_ID === 'your_plaid_client_id') {
      return res.json({
        link_token: 'link-sandbox-mock-token-' + Date.now(),
        expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      });
    }

    // Real Plaid integration (when credentials are added)
    const request = {
      user: {
        client_user_id: req.body.user_id || 'user-' + Date.now(),
      },
      client_name: 'Cash Me',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
    };

    const response = await plaidClient.linkTokenCreate(request);
    res.json(response.data);
  } catch (error) {
    console.error('Error creating link token:', error);
    res.status(500).json({ error: 'Failed to create link token' });
  }
};

// Exchange Public Token
const exchangePublicToken = async (req, res) => {
  try {
    const { public_token } = req.body;

    // In demo mode, return mock access token
    if (!process.env.PLAID_CLIENT_ID || process.env.PLAID_CLIENT_ID === 'your_plaid_client_id') {
      const mockAccessToken = 'access-sandbox-mock-token-' + Date.now();
      accessTokens[mockAccessToken] = {
        item_id: 'item-mock-' + Date.now(),
        created_at: new Date().toISOString()
      };

      return res.json({
        access_token: mockAccessToken,
        item_id: accessTokens[mockAccessToken].item_id
      });
    }

    // Real Plaid integration
    const response = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    const { access_token, item_id } = response.data;
    accessTokens[access_token] = { item_id };

    res.json({ access_token, item_id });
  } catch (error) {
    console.error('Error exchanging public token:', error);
    res.status(500).json({ error: 'Failed to exchange token' });
  }
};

// Get Accounts
const getAccounts = async (req, res) => {
  try {
    const { access_token } = req.body;

    // In demo mode, return mock accounts
    if (!process.env.PLAID_CLIENT_ID || process.env.PLAID_CLIENT_ID === 'your_plaid_client_id') {
      return res.json({
        accounts: mockAccounts,
        item: {
          institution_id: 'ins_mock',
          item_id: 'item-mock-001'
        }
      });
    }

    // Real Plaid integration
    const response = await plaidClient.accountsGet({
      access_token,
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error getting accounts:', error);
    res.status(500).json({ error: 'Failed to get accounts' });
  }
};

// Get Transactions
const getTransactions = async (req, res) => {
  try {
    const { access_token, start_date, end_date } = req.body;

    // In demo mode, return mock transactions
    if (!process.env.PLAID_CLIENT_ID || process.env.PLAID_CLIENT_ID === 'your_plaid_client_id') {
      let transactions = [...mockTransactions];

      // Filter by date if provided
      if (start_date) {
        transactions = transactions.filter(t => t.date >= start_date);
      }
      if (end_date) {
        transactions = transactions.filter(t => t.date <= end_date);
      }

      return res.json({
        transactions,
        accounts: mockAccounts,
        total_transactions: transactions.length
      });
    }

    // Real Plaid integration
    const response = await plaidClient.transactionsGet({
      access_token,
      start_date: start_date || '2025-01-01',
      end_date: end_date || new Date().toISOString().split('T')[0],
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
};

module.exports = {
  createLinkToken,
  exchangePublicToken,
  getAccounts,
  getTransactions,
};
