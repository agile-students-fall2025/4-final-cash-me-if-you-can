const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const {
  categorizeTransaction,
  categorizeTransactions,
  suggestCategories,
} = require('../utils/categorizer');

const normalizeCategoryName = (name = '') => name.trim();

const getTransactions = async (req, res) => {
  try {
    const { start_date, end_date, category } = req.query;
    const userId = req.user?.id || '673e8d9a5e9e123456789abc';

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
    const userId = req.user?.id || '673e8d9a5e9e123456789abc';

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
    const userId = req.user?.id || '673e8d9a5e9e123456789abc';

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
    const userId = req.user?.id || '673e8d9a5e9e123456789abc';

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
    const userId = req.user?.id;

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
    const userId = req.user?.id || '673e8d9a5e9e123456789abc';
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

module.exports = {
  getTransactions,
  categorizeAll,
  updateCategory,
  getCategorySuggestions,
  getSpendingByCategory,
  getCategories,
  createCategory,
};
