const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const auth = require('../middleware/authMiddleware');

// Get all accounts for a user (requires authentication)
router.get('/', auth, accountController.getAccounts);

// Get single account by ID (requires authentication)
router.get('/:id', auth, accountController.getAccountById);

// Create new manual account (requires authentication)
router.post('/', auth, accountController.createAccount);

// Update account (requires authentication)
router.put('/:id', auth, accountController.updateAccount);

// Delete account (requires authentication)
router.delete('/:id', auth, accountController.deleteAccount);

module.exports = router;
