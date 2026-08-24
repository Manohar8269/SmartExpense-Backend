const Transaction = require("../models/Transaction");

// ==========================================
// Create Transaction
// ==========================================
const createTransaction = async (req, res) => {
  try {
    const {
      type,
      amount,
      category,
      date,
      description,
    } = req.body;

    if (!type || !amount || !category || !date) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    if (!["expense", "income"].includes(type)) {
      return res.status(400).json({
        message: "Invalid transaction type",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }

    if (!req.userId) {
      return res.status(401).json({
        message: "User authentication required",
      });
    }

    const transaction = await Transaction.create({
      user: req.userId,
      type,
      amount: Number(amount),
      category,
      date,
      description: description || "",
    });

    return res.status(201).json({
      message: "Transaction added successfully",
      transaction,
    });
  } catch (error) {
    console.error("Create Transaction Error:", error);

    return res.status(500).json({
      message: "Server error while creating transaction",
    });
  }
};

// ==========================================
// Get Current User Transactions
// ==========================================
const getTransactions = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "User authentication required",
      });
    }

    const transactions = await Transaction.find({
      user: req.userId,
    }).sort({
      date: -1,
      createdAt: -1,
    });

    return res.status(200).json({
      transactions,
    });
  } catch (error) {
    console.error("Get Transactions Error:", error);

    return res.status(500).json({
      message: "Server error while fetching transactions",
    });
  }
};

// ==========================================
// Delete Transaction
// ==========================================
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.userId) {
      return res.status(401).json({
        message: "User authentication required",
      });
    }

    const transaction = await Transaction.findOne({
      _id: id,
      user: req.userId,
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    await Transaction.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error("Delete Transaction Error:", error);

    return res.status(500).json({
      message: "Server error while deleting transaction",
    });
  }
};

// ==========================================
// Update Transaction
// ==========================================
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      type,
      amount,
      category,
      date,
      description,
    } = req.body;

    if (!req.userId) {
      return res.status(401).json({
        message: "User authentication required",
      });
    }

    if (!type || !amount || !category || !date) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    if (!["expense", "income"].includes(type)) {
      return res.status(400).json({
        message: "Invalid transaction type",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }

    const transaction = await Transaction.findOne({
      _id: id,
      user: req.userId,
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    transaction.type = type;
    transaction.amount = Number(amount);
    transaction.category = category;
    transaction.date = date;
    transaction.description = description || "";

    await transaction.save();

    return res.status(200).json({
      message: "Transaction updated successfully",
      transaction,
    });
  } catch (error) {
    console.error(
      "Update Transaction Error:",
      error
    );

    return res.status(500).json({
      message: "Server error while updating transaction",
    });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  deleteTransaction,
  updateTransaction,
};