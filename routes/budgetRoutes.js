const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getBudget,
  updateBudget,
  updateCategoryBudget,
  deleteCategoryBudget,
  getBudgetAlerts,
} = require("../controllers/budgetController");

// ==========================================
// Get Budgets
// GET /api/budget
// ==========================================
router.get(
  "/",
  protect,
  getBudget
);

// ==========================================
// Get Budget Alerts
// GET /api/budget/alerts
// ==========================================
router.get(
  "/alerts",
  protect,
  getBudgetAlerts
);

// ==========================================
// Update Monthly Budget
// PUT /api/budget
// ==========================================
router.put(
  "/",
  protect,
  updateBudget
);

// ==========================================
// Update Category Budget
// PUT /api/budget/category
// ==========================================
router.put(
  "/category",
  protect,
  updateCategoryBudget
);

// ==========================================
// Delete Category Budget
// DELETE /api/budget/category/:category
// ==========================================
router.delete(
  "/category/:category",
  protect,
  deleteCategoryBudget
);

module.exports = router;