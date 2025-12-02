const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Get all transactions
router.get('/', transactionController.getTransactions);

// Create new manual transaction
router.post('/', transactionController.createTransaction);

// Update transaction
router.put('/:id', transactionController.updateTransaction);

// Delete transaction
router.delete('/:id', transactionController.deleteTransaction);

// Auto-categorize all transactions
router.post('/categorize', transactionController.categorizeAll);

// Category management
router.get('/categories', transactionController.getCategories);
router.post('/categories', transactionController.createCategory);

// Update transaction category
router.put('/:id/category', transactionController.updateCategory);

// Get category suggestions
router.get('/suggest-category', transactionController.getCategorySuggestions);

// Get spending by category
router.get('/by-category', transactionController.getSpendingByCategory);

module.exports = router;
