const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Get all transactions
router.get('/', transactionController.getTransactions);

// Auto-categorize all transactions
router.post('/categorize', transactionController.categorizeAll);

// Update transaction category
router.put('/:id/category', transactionController.updateCategory);

// Get category suggestions
router.get('/suggest-category', transactionController.getCategorySuggestions);

// Get spending by category
router.get('/by-category', transactionController.getSpendingByCategory);

module.exports = router;
