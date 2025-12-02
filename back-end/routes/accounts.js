const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

// Get all accounts for a user
router.get('/', accountController.getAccounts);

// Get single account by ID
router.get('/:id', accountController.getAccountById);

// Create new manual account
router.post('/', accountController.createAccount);

// Update account
router.put('/:id', accountController.updateAccount);

// Delete account
router.delete('/:id', accountController.deleteAccount);

module.exports = router;
