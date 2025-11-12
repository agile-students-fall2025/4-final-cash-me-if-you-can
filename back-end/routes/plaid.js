const express = require('express');
const router = express.Router();
const plaidController = require('../controllers/plaidController');

// Create link token for Plaid Link
router.post('/create_link_token', plaidController.createLinkToken);

// Exchange public token for access token
router.post('/exchange_public_token', plaidController.exchangePublicToken);

// Get accounts
router.post('/accounts', plaidController.getAccounts);

// Get transactions
router.post('/transactions', plaidController.getTransactions);

module.exports = router;
