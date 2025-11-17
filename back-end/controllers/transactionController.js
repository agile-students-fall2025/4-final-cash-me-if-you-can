const mockTransactions = require('../data/mockTransactions.json');
const defaultCategories = require('../data/categories.json');
const {
  categorizeTransaction,
  categorizeTransactions,
  suggestCategories,
} = require('../utils/categorizer');

// Store transaction updates temporarily (use database in production)
let transactionUpdates = {};
let categoryList = [...new Set(defaultCategories)];

const normalizeCategoryName = (name = '') => name.trim();
const categoryExists = (name) =>
  categoryList.some(category => category.toLowerCase() === name.toLowerCase());

/**
 * Get all transactions with auto-categorization
 */
const getTransactions = async (req, res) => {
  try {
    const { start_date, end_date, category } = req.query;

    let transactions = [...mockTransactions];

    // Apply manual category overrides
    transactions = transactions.map(t => ({
      ...t,
      category: transactionUpdates[t.transaction_id]?.category || t.category?.[0] || categorizeTransaction(t),
    }));

    // Filter by date
    if (start_date) {
      transactions = transactions.filter(t => t.date >= start_date);
    }
    if (end_date) {
      transactions = transactions.filter(t => t.date <= end_date);
    }

    // Filter by category
    if (category) {
      transactions = transactions.filter(t => t.category === category);
    }

    res.json({
      transactions,
      total: transactions.length,
    });
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
};

/**
 * Auto-categorize all transactions
 */
const categorizeAll = async (req, res) => {
  try {
    const categorized = categorizeTransactions(mockTransactions);

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

/**
 * Update transaction category manually
 */
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category } = req.body;

    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }

    // Find transaction
    const transaction = mockTransactions.find(t => t.transaction_id === id);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Store update
    transactionUpdates[id] = {
      ...transactionUpdates[id],
      category,
      updated_at: new Date().toISOString(),
    };

    res.json({
      transaction: {
        ...transaction,
        category,
      },
      message: 'Category updated successfully',
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

/**
 * Get category suggestions for a merchant
 */
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

/**
 * Get spending by category
 */
const getSpendingByCategory = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let transactions = [...mockTransactions];

    // Apply categorization
    transactions = transactions.map(t => ({
      ...t,
      category: transactionUpdates[t.transaction_id]?.category || t.category?.[0] || categorizeTransaction(t),
    }));

    // Filter by date
    if (start_date) {
      transactions = transactions.filter(t => t.date >= start_date);
    }
    if (end_date) {
      transactions = transactions.filter(t => t.date <= end_date);
    }

    // Filter out income
    transactions = transactions.filter(t => t.amount > 0);

    // Group by category
    const byCategory = {};
    transactions.forEach(t => {
      if (!byCategory[t.category]) {
        byCategory[t.category] = {
          category: t.category,
          total: 0,
          count: 0,
          transactions: [],
        };
      }
      byCategory[t.category].total += t.amount;
      byCategory[t.category].count += 1;
      byCategory[t.category].transactions.push({
        id: t.transaction_id,
        date: t.date,
        merchant: t.name,
        amount: t.amount,
      });
    });

    // Convert to array and sort by total
    const categories = Object.values(byCategory)
      .map(c => ({
        category: c.category,
        total: parseFloat(c.total.toFixed(2)),
        count: c.count,
        percentage: 0, // Will calculate after
      }))
      .sort((a, b) => b.total - a.total);

    // Calculate percentages
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

/**
 * Get available categories (default + custom)
 */
const getCategories = (req, res) => {
  try {
    res.json({
      categories: [...categoryList],
      total: categoryList.length,
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
};

/**
 * Create a new custom category
 */
const createCategory = (req, res) => {
  try {
    const normalizedName = normalizeCategoryName(req.body?.name);

    if (!normalizedName) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    if (categoryExists(normalizedName)) {
      return res.status(409).json({ error: 'Category already exists' });
    }

    categoryList.push(normalizedName);

    res.status(201).json({
      category: normalizedName,
      categories: [...categoryList],
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
