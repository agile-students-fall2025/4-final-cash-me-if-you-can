const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const { v4: uuidv4 } = require("uuid");

// Get period date range
const getPeriodRange = (period, startDate = new Date()) => {
  const now = new Date();
  let start, end;

  switch (period) {
    case "weekly":
      start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(start.getDate() + 7);
      break;
    case "yearly":
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear() + 1, 0, 1);
      break;
    case "monthly":
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      break;
  }

  return { start, end };
};

// Calculate spending for a category in a period
const calculateSpending = async (userId, category, period) => {
  const { start, end } = getPeriodRange(period);

  const transactions = await Transaction.find({
    user_id: userId,
    category: { $in: [category] },
    date: { $gte: start, $lt: end },
    amount: { $gt: 0 },
  });

  const spent = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  return parseFloat(spent.toFixed(2));
};

// Create a new budget
exports.createBudget = async (req, res) => {
  try {
    const userId = req.userId;
    const { category, amount, period = "monthly", notes } = req.body;

    if (!category || !amount) {
      return res.status(400).json({ error: "Category and amount are required" });
    }

    // Check if budget already exists for this category
    const existing = await Budget.findOne({
      user_id: userId,
      category: category,
      is_active: true,
    });

    if (existing) {
      return res.status(400).json({
        error: `A budget for ${category} already exists. Update it instead.`,
      });
    }

    const budget = await Budget.create({
      budget_id: `budget_${uuidv4()}`,
      user_id: userId,
      category,
      amount,
      period,
      notes,
    });

    res.status(201).json({
      message: `Budget created: $${amount} for ${category} (${period})`,
      budget,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all budgets for user
exports.getBudgets = async (req, res) => {
  try {
    const userId = req.userId;
    const budgets = await Budget.find({ user_id: userId, is_active: true });

    // Calculate spending for each budget
    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await calculateSpending(userId, budget.category, budget.period);
        const remaining = budget.amount - spent;
        const percentage = ((spent / budget.amount) * 100).toFixed(1);

        return {
          ...budget.toObject(),
          spent,
          remaining: parseFloat(remaining.toFixed(2)),
          percentage: parseFloat(percentage),
        };
      })
    );

    res.json({ budgets: budgetsWithSpending });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single budget with spending
exports.getBudget = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const budget = await Budget.findOne({
      $or: [{ budget_id: id }, { _id: id }],
      user_id: userId,
    });

    if (!budget) {
      return res.status(404).json({ error: "Budget not found" });
    }

    const spent = await calculateSpending(userId, budget.category, budget.period);
    const remaining = budget.amount - spent;
    const percentage = ((spent / budget.amount) * 100).toFixed(1);

    res.json({
      ...budget.toObject(),
      spent,
      remaining: parseFloat(remaining.toFixed(2)),
      percentage: parseFloat(percentage),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get budget by category
exports.getBudgetByCategory = async (req, res) => {
  try {
    const userId = req.userId;
    const { category } = req.params;

    const budget = await Budget.findOne({
      user_id: userId,
      category: { $regex: new RegExp(`^${category}$`, "i") },
      is_active: true,
    });

    if (!budget) {
      return res.status(404).json({ error: `No budget found for ${category}` });
    }

    const spent = await calculateSpending(userId, budget.category, budget.period);
    const remaining = budget.amount - spent;
    const percentage = ((spent / budget.amount) * 100).toFixed(1);

    res.json({
      ...budget.toObject(),
      spent,
      remaining: parseFloat(remaining.toFixed(2)),
      percentage: parseFloat(percentage),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update budget
exports.updateBudget = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { amount, period, notes, is_active } = req.body;

    const updates = {};
    if (amount !== undefined) updates.amount = amount;
    if (period !== undefined) updates.period = period;
    if (notes !== undefined) updates.notes = notes;
    if (is_active !== undefined) updates.is_active = is_active;

    const budget = await Budget.findOneAndUpdate(
      {
        $or: [{ budget_id: id }, { _id: id }],
        user_id: userId,
      },
      updates,
      { new: true }
    );

    if (!budget) {
      return res.status(404).json({ error: "Budget not found" });
    }

    res.json({
      message: `Budget updated: $${budget.amount} for ${budget.category}`,
      budget,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update budget by category
exports.updateBudgetByCategory = async (req, res) => {
  try {
    const userId = req.userId;
    const { category } = req.params;
    const { amount, period, notes } = req.body;

    const updates = {};
    if (amount !== undefined) updates.amount = amount;
    if (period !== undefined) updates.period = period;
    if (notes !== undefined) updates.notes = notes;

    const budget = await Budget.findOneAndUpdate(
      {
        user_id: userId,
        category: { $regex: new RegExp(`^${category}$`, "i") },
        is_active: true,
      },
      updates,
      { new: true }
    );

    if (!budget) {
      return res.status(404).json({ error: `No budget found for ${category}` });
    }

    res.json({
      message: `Budget updated: $${budget.amount} for ${budget.category}`,
      budget,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete budget
exports.deleteBudget = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const budget = await Budget.findOneAndDelete({
      $or: [{ budget_id: id }, { _id: id }],
      user_id: userId,
    });

    if (!budget) {
      return res.status(404).json({ error: "Budget not found" });
    }

    res.json({
      message: `Budget for ${budget.category} deleted`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Helper function for chatbot tools
exports.getBudgetStatus = async (userId, category = null) => {
  try {
    const query = { user_id: userId, is_active: true };
    if (category) {
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    const budgets = await Budget.find(query);

    if (budgets.length === 0) {
      return category
        ? { error: `No budget found for ${category}` }
        : { error: "No budgets set up yet" };
    }

    const results = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await calculateSpending(userId, budget.category, budget.period);
        const remaining = budget.amount - spent;
        const percentage = ((spent / budget.amount) * 100).toFixed(1);

        return {
          category: budget.category,
          budget_amount: budget.amount,
          spent,
          remaining: parseFloat(remaining.toFixed(2)),
          percentage: parseFloat(percentage),
          period: budget.period,
          status: remaining < 0 ? "over_budget" : remaining < budget.amount * 0.1 ? "near_limit" : "on_track",
        };
      })
    );

    return category ? results[0] : { budgets: results };
  } catch (err) {
    return { error: err.message };
  }
};

exports.createBudgetForChat = async (userId, category, amount, period = "monthly") => {
  try {
    // Check if budget already exists
    const existing = await Budget.findOne({
      user_id: userId,
      category: { $regex: new RegExp(`^${category}$`, "i") },
      is_active: true,
    });

    if (existing) {
      // Update existing budget
      existing.amount = amount;
      existing.period = period;
      await existing.save();
      return {
        message: `Updated your ${category} budget to $${amount} (${period})`,
        budget: existing,
        updated: true,
      };
    }

    const budget = await Budget.create({
      budget_id: `budget_${uuidv4()}`,
      user_id: userId,
      category,
      amount,
      period,
    });

    return {
      message: `Created a ${period} budget of $${amount} for ${category}`,
      budget,
      created: true,
    };
  } catch (err) {
    return { error: err.message };
  }
};

exports.updateBudgetForChat = async (userId, category, newAmount) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      {
        user_id: userId,
        category: { $regex: new RegExp(`^${category}$`, "i") },
        is_active: true,
      },
      { amount: newAmount },
      { new: true }
    );

    if (!budget) {
      return { error: `No budget found for ${category}. Create one first!` };
    }

    return {
      message: `Updated ${category} budget to $${newAmount}`,
      budget,
    };
  } catch (err) {
    return { error: err.message };
  }
};
