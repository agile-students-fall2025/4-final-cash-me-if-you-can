const RecurringTransaction = require('../models/RecurringTransaction');
const Transaction = require('../models/Transaction');
const { v4: uuidv4 } = require('uuid');
const { categorizeTransaction } = require('../utils/categorizer');

/**
 * Calculate next occurrence date based on frequency
 */
const calculateNextOccurrence = (currentDate, frequency, dayOfMonth, dayOfWeek) => {
  const next = new Date(currentDate);

  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'biweekly':
      next.setDate(next.getDate() + 14);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      if (dayOfMonth) {
        next.setDate(Math.min(dayOfMonth, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
      }
      break;
    case 'quarterly':
      next.setMonth(next.getMonth() + 3);
      if (dayOfMonth) {
        next.setDate(Math.min(dayOfMonth, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
      }
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
  }

  return next;
};

/**
 * Get all recurring transactions
 */
const getRecurringTransactions = async (req, res) => {
  try {
    const userId = req.user?.id || '673e8d9a5e9e123456789abc';

    const recurringTransactions = await RecurringTransaction.find({ user_id: userId }).sort({ next_occurrence: 1 });

    res.json(recurringTransactions);
  } catch (error) {
    console.error('Error getting recurring transactions:', error);
    res.status(500).json({ error: 'Failed to get recurring transactions' });
  }
};

/**
 * Get a single recurring transaction by ID
 */
const getRecurringTransactionById = async (req, res) => {
  try {
    const userId = req.user?.id || '673e8d9a5e9e123456789abc';
    const recurringId = req.params.id;

    const recurringTransaction = await RecurringTransaction.findOne({
      $or: [
        { recurring_id: recurringId },
        { _id: recurringId }
      ],
      user_id: userId
    });

    if (!recurringTransaction) {
      return res.status(404).json({ error: 'Recurring transaction not found' });
    }

    res.json(recurringTransaction);
  } catch (error) {
    console.error('Error getting recurring transaction:', error);
    res.status(500).json({ error: 'Failed to get recurring transaction' });
  }
};

/**
 * Create a new recurring transaction
 */
const createRecurringTransaction = async (req, res) => {
  try {
    const userId = req.user?.id || '673e8d9a5e9e123456789abc';
    const {
      account_id,
      name,
      merchant_name,
      amount,
      category,
      frequency,
      start_date,
      end_date,
      day_of_month,
      day_of_week,
      notes,
      payment_channel
    } = req.body;

    // Validation
    if (!account_id || !name || amount === undefined || !frequency || !start_date) {
      return res.status(400).json({
        error: 'Missing required fields: account_id, name, amount, frequency, start_date'
      });
    }

    const startDate = new Date(start_date);
    const nextOccurrence = calculateNextOccurrence(startDate, frequency, day_of_month, day_of_week);

    // Create recurring transaction object
    const recurringTransactionData = {
      recurring_id: `recurring_${uuidv4()}`,
      user_id: userId,
      account_id,
      name,
      merchant_name: merchant_name || name,
      amount: parseFloat(amount),
      category: category ? (Array.isArray(category) ? category : [category]) : [],
      frequency,
      start_date: startDate,
      end_date: end_date ? new Date(end_date) : null,
      next_occurrence: nextOccurrence,
      day_of_month: day_of_month || null,
      day_of_week: day_of_week || null,
      notes: notes || '',
      payment_channel: payment_channel || 'other',
      is_active: true,
      currency_code: 'USD'
    };

    // Auto-categorize if no category provided
    if (recurringTransactionData.category.length === 0) {
      const suggestedCategory = categorizeTransaction(recurringTransactionData);
      recurringTransactionData.category = [suggestedCategory];
    }

    // Save to MongoDB
    const recurringTransaction = new RecurringTransaction(recurringTransactionData);
    await recurringTransaction.save();

    res.status(201).json(recurringTransaction);
  } catch (error) {
    console.error('Error creating recurring transaction:', error);
    res.status(500).json({ error: 'Failed to create recurring transaction' });
  }
};

/**
 * Update a recurring transaction
 */
const updateRecurringTransaction = async (req, res) => {
  try {
    const userId = req.user?.id || '673e8d9a5e9e123456789abc';
    const recurringId = req.params.id;
    const {
      name,
      merchant_name,
      amount,
      category,
      frequency,
      start_date,
      end_date,
      day_of_month,
      day_of_week,
      notes,
      payment_channel,
      is_active
    } = req.body;

    // Find recurring transaction
    const recurringTransaction = await RecurringTransaction.findOne({
      $or: [
        { recurring_id: recurringId },
        { _id: recurringId }
      ],
      user_id: userId
    });

    if (!recurringTransaction) {
      return res.status(404).json({ error: 'Recurring transaction not found' });
    }

    // Update fields
    if (name) recurringTransaction.name = name;
    if (merchant_name) recurringTransaction.merchant_name = merchant_name;
    if (amount !== undefined) recurringTransaction.amount = parseFloat(amount);
    if (category) recurringTransaction.category = Array.isArray(category) ? category : [category];
    if (frequency) {
      recurringTransaction.frequency = frequency;
      // Recalculate next occurrence if frequency changed
      recurringTransaction.next_occurrence = calculateNextOccurrence(
        recurringTransaction.next_occurrence,
        frequency,
        day_of_month || recurringTransaction.day_of_month,
        day_of_week || recurringTransaction.day_of_week
      );
    }
    if (start_date) recurringTransaction.start_date = new Date(start_date);
    if (end_date !== undefined) recurringTransaction.end_date = end_date ? new Date(end_date) : null;
    if (day_of_month !== undefined) recurringTransaction.day_of_month = day_of_month;
    if (day_of_week !== undefined) recurringTransaction.day_of_week = day_of_week;
    if (notes !== undefined) recurringTransaction.notes = notes;
    if (payment_channel) recurringTransaction.payment_channel = payment_channel;
    if (is_active !== undefined) recurringTransaction.is_active = is_active;

    await recurringTransaction.save();

    res.json(recurringTransaction);
  } catch (error) {
    console.error('Error updating recurring transaction:', error);
    res.status(500).json({ error: 'Failed to update recurring transaction' });
  }
};

/**
 * Delete a recurring transaction
 */
const deleteRecurringTransaction = async (req, res) => {
  try {
    const userId = req.user?.id || '673e8d9a5e9e123456789abc';
    const recurringId = req.params.id;

    const recurringTransaction = await RecurringTransaction.findOneAndDelete({
      $or: [
        { recurring_id: recurringId },
        { _id: recurringId }
      ],
      user_id: userId
    });

    if (!recurringTransaction) {
      return res.status(404).json({ error: 'Recurring transaction not found' });
    }

    res.json({ message: 'Recurring transaction deleted successfully', recurringTransaction });
  } catch (error) {
    console.error('Error deleting recurring transaction:', error);
    res.status(500).json({ error: 'Failed to delete recurring transaction' });
  }
};

/**
 * Process due recurring transactions (create actual transactions)
 * This should be called periodically (e.g., daily cron job)
 */
const processDueRecurringTransactions = async (req, res) => {
  try {
    const now = new Date();

    // Find all active recurring transactions that are due
    const dueTransactions = await RecurringTransaction.find({
      is_active: true,
      next_occurrence: { $lte: now },
      $or: [
        { end_date: null },
        { end_date: { $gte: now } }
      ]
    });

    const createdTransactions = [];

    for (const recurring of dueTransactions) {
      // Create actual transaction
      const transactionData = {
        transaction_id: `auto_${uuidv4()}`,
        account_id: recurring.account_id,
        user_id: recurring.user_id,
        is_manual: false,
        source: 'recurring',
        date: recurring.next_occurrence,
        name: recurring.name,
        merchant_name: recurring.merchant_name,
        amount: recurring.amount,
        category: recurring.category,
        payment_channel: recurring.payment_channel,
        notes: recurring.notes ? `${recurring.notes} (Auto-generated from recurring transaction)` : '(Auto-generated from recurring transaction)',
        pending: false,
        currency_code: recurring.currency_code
      };

      const transaction = new Transaction(transactionData);
      await transaction.save();
      createdTransactions.push(transaction);

      // Update recurring transaction
      recurring.last_executed = recurring.next_occurrence;
      recurring.next_occurrence = calculateNextOccurrence(
        recurring.next_occurrence,
        recurring.frequency,
        recurring.day_of_month,
        recurring.day_of_week
      );

      // Deactivate if end date is reached
      if (recurring.end_date && recurring.next_occurrence > recurring.end_date) {
        recurring.is_active = false;
      }

      await recurring.save();
    }

    res.json({
      message: `Processed ${dueTransactions.length} recurring transactions`,
      created_transactions: createdTransactions.length,
      transactions: createdTransactions
    });
  } catch (error) {
    console.error('Error processing recurring transactions:', error);
    res.status(500).json({ error: 'Failed to process recurring transactions' });
  }
};

module.exports = {
  getRecurringTransactions,
  getRecurringTransactionById,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  processDueRecurringTransactions
};
