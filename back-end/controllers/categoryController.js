const Category = require('../models/Category');

const DEFAULT_USER_ID = '673e8d9a5e9e123456789abc';

const getCategories = async (req, res) => {
  try {
    const userId = req.user?.id || DEFAULT_USER_ID;

    const categories = await Category.find({
      $or: [
        { system: true },
        { user_id: userId }
      ]
    }).sort({ system: -1, name: 1 });

    res.json({
      categories,
      total: categories.length,
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const userId = req.user?.id || DEFAULT_USER_ID;
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    if (!category.system && category.user_id?.toString() !== userId?.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(category);
  } catch (error) {
    console.error('Error getting category:', error);
    res.status(500).json({ error: 'Failed to get category' });
  }
};

const createCategory = async (req, res) => {
  try {
    const userId = req.user?.id || DEFAULT_USER_ID;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      $or: [{ system: true }, { user_id: userId }]
    });

    if (existingCategory) {
      return res.status(409).json({ error: 'Category already exists' });
    }

    const category = await Category.create({
      ...req.body,
      name: name.trim(),
      user_id: userId,
      system: false,
    });

    res.status(201).json({
      category,
      message: 'Category created successfully',
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const userId = req.user?.id || DEFAULT_USER_ID;
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    if (category.system) {
      return res.status(403).json({ error: 'Cannot modify system categories' });
    }

    if (category.user_id?.toString() !== userId?.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await Category.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      category: updated,
      message: 'Category updated successfully',
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const userId = req.user?.id || DEFAULT_USER_ID;
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    if (category.system) {
      return res.status(403).json({ error: 'Cannot delete system categories' });
    }

    if (category.user_id?.toString() !== userId?.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await Category.findByIdAndDelete(id);

    res.json({
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};

const suggestCategoriesForMerchant = async (req, res) => {
  try {
    const { merchant } = req.params;

    if (!merchant) {
      return res.status(400).json({ error: 'Merchant name is required' });
    }

    const merchantLower = merchant.toLowerCase();

    const categories = await Category.find({
      system: true,
      keywords: { $regex: merchantLower, $options: 'i' }
    }).limit(5);

    res.json({
      merchant,
      suggestions: categories.map(c => c.name),
    });
  } catch (error) {
    console.error('Error suggesting categories:', error);
    res.status(500).json({ error: 'Failed to suggest categories' });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  suggestCategoriesForMerchant,
};
