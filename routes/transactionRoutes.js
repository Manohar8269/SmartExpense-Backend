const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createTransaction,
  getTransactions,
  deleteTransaction,
  updateTransaction,
} = require("../controllers/transactionController");

// Create transaction
router.post("/", protect, createTransaction);

// Get current user's transactions
router.get("/", protect, getTransactions);

// Delete transaction
router.delete("/:id", protect, deleteTransaction);

// Updat transaction
router.put("/:id", protect, updateTransaction);

module.exports = router;