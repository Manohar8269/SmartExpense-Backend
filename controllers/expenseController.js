// const { getEndPoints } = require("recharts/types/cartesian/ReferenceLine");
const Expense = require("../models/Expense");

const addExpense = async (req, res) => {
  try {
    const {
      title,
      amount,
      category,
      type,
      note,
      date,
    } = req.body;

    // Check required fields
    if (!title || !amount || !category) {
      return res.status(400).json({
        message: "Please provide title, amount and category",
      });
    }

    // Create expense
    const expense = await Expense.create({
      userId: req.userId,
      title,
      amount,
      category,
      type: type || "expense",
      note,
      date,
    });

    res.status(201).json({
      message: "Expense added successfully",
      expense,
    });
  } catch (error) {
    console.error("Add Expense Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({
      userId: req.userId,
    }).sort({ date: -1 });

    res.status(200).json({
      message: "Expenses fetched successfully",
      count: expenses.length,
      expenses,
    });
  } catch (error) {
    console.error("Get Expenses Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getSingleExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    res.status(200).json({
      message: "Expense fetched successfully",
      expense,
    });
  } catch (error) {
    console.error("Get Single Expense Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const updateExpense = async (req, res) => {
  try {
    const {
      title,
      amount,
      category,
      type,
      note,
      date,
    } = req.body;

    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    // Update only provided fields
    if (title !== undefined) expense.title = title;
    if (amount !== undefined) expense.amount = amount;
    if (category !== undefined) expense.category = category;
    if (type !== undefined) expense.type = type;
    if (note !== undefined) expense.note = note;
    if (date !== undefined) expense.date = date;

    const updatedExpense = await expense.save();

    res.status(200).json({
      message: "Expense updated successfully",
      expense: updatedExpense,
    });
  } catch (error) {
    console.error("Update Expense Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Delete Expense
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    await Expense.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error("Delete Expense Error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  addExpense,getExpenses,getSingleExpense,updateExpense,deleteExpense,
};