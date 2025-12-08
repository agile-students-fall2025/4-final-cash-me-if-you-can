const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const transactionController = require('../controllers/transactionController');

// Get all transactions
router.get('/', auth, transactionController.getTransactions);

// Create new manual transaction
router.post('/', auth, transactionController.createTransaction);

// Update transaction
router.put('/:id', auth, transactionController.updateTransaction);

// Delete transaction
router.delete('/:id', auth, transactionController.deleteTransaction);

// Auto-categorize all transactions
router.post('/categorize', auth, transactionController.categorizeAll);

// Category management
router.get('/categories', auth, transactionController.getCategories);
router.post('/categories', auth, transactionController.createCategory);

// Update transaction category
router.put('/:id/category', auth, transactionController.updateCategory);

// Get category suggestions
router.get('/suggest-category', auth, transactionController.getCategorySuggestions);

// Get spending by category
router.get('/by-category', auth, transactionController.getSpendingByCategory);

module.exports = router;
