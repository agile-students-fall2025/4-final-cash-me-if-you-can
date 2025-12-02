const express = require('express');
const router = express.Router();
const recurringTransactionController = require('../controllers/recurringTransactionController');

// Get all recurring transactions
router.get('/', recurringTransactionController.getRecurringTransactions);

// Get single recurring transaction by ID
router.get('/:id', recurringTransactionController.getRecurringTransactionById);

// Create new recurring transaction
router.post('/', recurringTransactionController.createRecurringTransaction);

// Update recurring transaction
router.put('/:id', recurringTransactionController.updateRecurringTransaction);

// Delete recurring transaction
router.delete('/:id', recurringTransactionController.deleteRecurringTransaction);

// Process due recurring transactions (should be called by cron job)
router.post('/process', recurringTransactionController.processDueRecurringTransactions);

module.exports = router;
