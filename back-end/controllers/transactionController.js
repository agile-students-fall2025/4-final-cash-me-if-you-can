const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const { v4: uuidv4 } = require('uuid');
const {
  categorizeTransaction,
  categorizeTransactions,
  suggestCategories,
} = require('../utils/categorizer');
const { syncVectorStore } = require('../utils/vectorStore');

const normalizeCategoryName = (name = '') => name.trim();

const getTransactions = async (req, res) => {
  try {
    const { start_date, end_date, category } = req.query;
    const userId = req.userId; // From auth middleware

    let query = { user_id: userId };

    if (start_date || end_date) {
      query.date = {};
      if (start_date) query.date.$gte = new Date(start_date);
      if (end_date) query.date.$lte = new Date(end_date);
    }

    if (category) {
      query.category = { $in: [category] };
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });

    res.json({
      transactions,
      total: transactions.length,
    });
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
};

const categorizeAll = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware

    const transactions = await Transaction.find({ user_id: userId });

    const updates = transactions.map(async (transaction) => {
      if (!transaction.category || transaction.category.length === 0) {
        const category = categorizeTransaction(transaction);
        transaction.category = [category];
        await transaction.save();
      }
      return transaction;
    });

    const categorized = await Promise.all(updates);

    res.json({
      transactions: categorized,
      total: categorized.length,
      message: 'Transactions categorized successfully',
    });
  } catch (error) {
    console.error('Error categorizing transactions:', error);
    res.status(500).json({ error: 'Failed to categorize transactions' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category } = req.body;
    const userId = req.userId; // From auth middleware

    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }

    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.user_id.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    transaction.category = Array.isArray(category) ? category : [category];
    await transaction.save();

    res.json({
      transaction,
      message: 'Category updated successfully',
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

const getCategorySuggestions = async (req, res) => {
  try {
    const { merchant } = req.query;

    if (!merchant) {
      return res.status(400).json({ error: 'Merchant name is required' });
    }

    const suggestions = suggestCategories(merchant);

    res.json({
      merchant,
      suggestions,
    });
  } catch (error) {
    console.error('Error getting suggestions:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
};

const getSpendingByCategory = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const userId = req.userId; // From auth middleware

    let query = { user_id: userId, amount: { $gt: 0 } };

    if (start_date || end_date) {
      query.date = {};
      if (start_date) query.date.$gte = new Date(start_date);
      if (end_date) query.date.$lte = new Date(end_date);
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });

    const byCategory = {};
    transactions.forEach(t => {
      const categoryName = t.category && t.category.length > 0 ? t.category[0] : 'Uncategorized';

      if (!byCategory[categoryName]) {
        byCategory[categoryName] = {
          category: categoryName,
          total: 0,
          count: 0,
          transactions: [],
        };
      }
      byCategory[categoryName].total += t.amount;
      byCategory[categoryName].count += 1;
      byCategory[categoryName].transactions.push({
        id: t.transaction_id,
        date: t.date,
        merchant: t.name,
        amount: t.amount,
      });
    });

    const categories = Object.values(byCategory)
      .map(c => ({
        category: c.category,
        total: parseFloat(c.total.toFixed(2)),
        count: c.count,
        percentage: 0,
      }))
      .sort((a, b) => b.total - a.total);

    const grandTotal = categories.reduce((sum, c) => sum + c.total, 0);
    categories.forEach(c => {
      c.percentage = parseFloat(((c.total / grandTotal) * 100).toFixed(1));
    });

    res.json({
      categories,
      total_spending: parseFloat(grandTotal.toFixed(2)),
      period: {
        start: start_date || 'all time',
        end: end_date || 'present',
      },
    });
  } catch (error) {
    console.error('Error getting spending by category:', error);
    res.status(500).json({ error: 'Failed to get spending by category' });
  }
};

const getCategories = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware

    const categories = await Category.find({
      $or: [
        { system: true },
        { user_id: userId }
      ]
    }).sort({ system: -1, name: 1 });

    res.json({
      categories: categories.map(c => c.name),
      total: categories.length,
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
};

const createCategory = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    const normalizedName = normalizeCategoryName(req.body?.name);

    if (!normalizedName) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${normalizedName}$`, 'i') },
      $or: [{ system: true }, { user_id: userId }]
    });

    if (existingCategory) {
      return res.status(409).json({ error: 'Category already exists' });
    }

    const category = await Category.create({
      name: normalizedName,
      user_id: userId,
      system: false,
    });

    res.status(201).json({
      category: category.name,
      message: 'Category created successfully',
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

// Create new manual transaction
const createTransaction = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    const { account_id, date, name, merchant_name, amount, category, payment_channel, notes } = req.body;

    // Validation
    if (!account_id || !date || !name || amount === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: account_id, date, name, amount'
      });
    }

    // Create transaction object
    const transactionData = {
      transaction_id: `manual_${uuidv4()}`,
      account_id,
      user_id: userId,
      is_manual: true,
      source: 'manual',
      date: new Date(date),
      name,
      merchant_name: merchant_name || name,
      amount: parseFloat(amount),
      category: category ? (Array.isArray(category) ? category : [category]) : [],
      payment_channel: payment_channel || 'other',
      notes: notes || '',
      pending: false,
      currency_code: 'USD'
    };

    // Auto-categorize if no category provided
    if (transactionData.category.length === 0) {
      const suggestedCategory = categorizeTransaction(transactionData);
      transactionData.category = [suggestedCategory];
    }

    // Save to MongoDB
    const transaction = new Transaction(transactionData);
    await transaction.save();

    // Sync vector store with new transaction data
    syncVectorStore().catch(err => console.error('[transactionController] Vector sync failed:', err.message));

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

// Update transaction
const updateTransaction = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    const transactionId = req.params.id;
    const { date, name, merchant_name, amount, category, payment_channel, notes } = req.body;

    let transaction;

    // Check if transactionId is a valid MongoDB ObjectId (24 hex characters)
    if (transactionId.match(/^[0-9a-fA-F]{24}$/)) {
      transaction = await Transaction.findOne({
        $or: [
          { transaction_id: transactionId },
          { _id: transactionId }
        ]
      });
    } else {
      // Search only by transaction_id for UUID strings
      transaction = await Transaction.findOne({ transaction_id: transactionId });
    }

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Update fields
    if (date) transaction.date = new Date(date);
    if (name) transaction.name = name;
    if (merchant_name) transaction.merchant_name = merchant_name;
    if (amount !== undefined) transaction.amount = parseFloat(amount);
    if (category) transaction.category = Array.isArray(category) ? category : [category];
    if (payment_channel) transaction.payment_channel = payment_channel;
    if (notes !== undefined) transaction.notes = notes;

    await transaction.save();

    // Sync vector store with updated transaction data
    syncVectorStore().catch(err => console.error('[transactionController] Vector sync failed:', err.message));

    res.json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};

// Delete transaction
const deleteTransaction = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    const transactionId = req.params.id;

    // Build query - only include _id if it's a valid ObjectId
    const query = { transaction_id: transactionId };

    // Check if transactionId is a valid MongoDB ObjectId (24 hex characters)
    if (transactionId.match(/^[0-9a-fA-F]{24}$/)) {
      // If valid ObjectId, search by both transaction_id and _id
      const transaction = await Transaction.findOneAndDelete({
        $or: [
          { transaction_id: transactionId },
          { _id: transactionId }
        ]
      });

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      // Sync vector store after transaction deletion
      syncVectorStore().catch(err => console.error('[transactionController] Vector sync failed:', err.message));

      return res.json({ message: 'Transaction deleted successfully', transaction });
    }

    // Otherwise, only search by transaction_id (e.g., for manual_ UUIDs)
    const transaction = await Transaction.findOneAndDelete(query);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Sync vector store after transaction deletion
    syncVectorStore().catch(err => console.error('[transactionController] Vector sync failed:', err.message));

    res.json({ message: 'Transaction deleted successfully', transaction });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  categorizeAll,
  updateCategory,
  getCategorySuggestions,
  getSpendingByCategory,
  getCategories,
  createCategory,
};
