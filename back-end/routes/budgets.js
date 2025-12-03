const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  createBudget,
  getBudgets,
  getBudget,
  getBudgetByCategory,
  updateBudget,
  updateBudgetByCategory,
  deleteBudget,
} = require("../controllers/budgetController");

// All routes require authentication
router.use(auth);

// Create a new budget
router.post("/", createBudget);

// Get all budgets for user
router.get("/", getBudgets);

// Get budget by category name
router.get("/category/:category", getBudgetByCategory);

// Get single budget by ID
router.get("/:id", getBudget);

// Update budget by category
router.patch("/category/:category", updateBudgetByCategory);

// Update budget by ID
router.patch("/:id", updateBudget);

// Delete budget by ID
router.delete("/:id", deleteBudget);

module.exports = router;
