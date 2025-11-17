const express = require('express');
const router = express.Router();
const plaidController = require('../controllers/plaidController');
const { validateRequired, validateTransactionDates, validateAccessToken, validatePagination } = require('../middleware/validation');

// Create link token for Plaid Link
// Optional: user_id in body
router.post('/create_link_token', plaidController.createLinkToken);

// Exchange public token for access token
// Required: public_token in body
router.post(
  '/exchange_public_token',
  validateRequired(['public_token']),
  plaidController.exchangePublicToken
);

// Get accounts
// Required: access_token in body
router.post(
  '/accounts',
  validateRequired(['access_token']),
  validateAccessToken,
  plaidController.getAccounts
);

// Get transactions
// Required: access_token in body
// Optional: start_date, end_date in body; page, limit in query
router.post(
  '/transactions',
  validateRequired(['access_token']),
  validateAccessToken,
  validateTransactionDates,
  validatePagination,
  plaidController.getTransactions
);

module.exports = router;
