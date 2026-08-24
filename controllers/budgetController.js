const User = require("../models/User");
const Transaction = require("../models/Transaction");

// ==========================================
// Get Monthly Budget
// ==========================================
const getBudget = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "User authentication required",
      });
    }

    const user = await User.findById(req.userId).select(
      "monthlyBudget categoryBudgets"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      monthlyBudget: user.monthlyBudget || 0,

      categoryBudgets: user.categoryBudgets
        ? Object.fromEntries(user.categoryBudgets)
        : {},
    });
  } catch (error) {
    console.error("Get Budget Error:", error);

    return res.status(500).json({
      message: "Server error while fetching budget",
    });
  }
};

// ==========================================
// Update Monthly Budget
// ==========================================
const updateBudget = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "User authentication required",
      });
    }

    const { monthlyBudget } = req.body;

    if (
      monthlyBudget === undefined ||
      monthlyBudget === null ||
      Number.isNaN(Number(monthlyBudget)) ||
      Number(monthlyBudget) < 0
    ) {
      return res.status(400).json({
        message: "Please enter a valid budget",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.monthlyBudget = Number(monthlyBudget);

    await user.save();

    return res.status(200).json({
      message: "Monthly budget updated successfully",
      monthlyBudget: user.monthlyBudget,
    });
  } catch (error) {
    console.error("Update Budget Error:", error);

    return res.status(500).json({
      message: "Server error while updating budget",
    });
  }
};

// ==========================================
// Update Category Budget
// ==========================================
const updateCategoryBudget = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "User authentication required",
      });
    }

    const { category, amount } = req.body;

    if (!category || category.trim() === "") {
      return res.status(400).json({
        message: "Category is required",
      });
    }

    if (
      amount === undefined ||
      amount === null ||
      Number.isNaN(Number(amount)) ||
      Number(amount) < 0
    ) {
      return res.status(400).json({
        message: "Please enter a valid category budget",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.categoryBudgets) {
      user.categoryBudgets = new Map();
    }

    user.categoryBudgets.set(
      category.trim(),
      Number(amount)
    );

    await user.save();

    return res.status(200).json({
      message: "Category budget updated successfully",
      category: category.trim(),
      amount: Number(amount),
    });
  } catch (error) {
    console.error(
      "Update Category Budget Error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while updating category budget",
    });
  }
};

// ==========================================
// Delete Category Budget
// ==========================================
const deleteCategoryBudget = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "User authentication required",
      });
    }

    const { category } = req.params;

    if (!category || category.trim() === "") {
      return res.status(400).json({
        message: "Category is required",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.categoryBudgets) {
      user.categoryBudgets.delete(category.trim());

      await user.save();
    }

    return res.status(200).json({
      message: "Category budget removed successfully",
    });
  } catch (error) {
    console.error(
      "Delete Category Budget Error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while deleting category budget",
    });
  }
};

// ==========================================
// Get Budget Alerts
// ==========================================
// This function checks:
// 1. Monthly budget exceeded
// 2. 80% monthly budget used
// 3. Category budget exceeded
// 4. 80% category budget used
// ==========================================
const getBudgetAlerts = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "User authentication required",
      });
    }

    // ------------------------------------------
    // Get User Budget
    // ------------------------------------------
    const user = await User.findById(req.userId).select(
      "monthlyBudget categoryBudgets"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // ------------------------------------------
    // Current Month Start & End
    // ------------------------------------------
    const now = new Date();

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0
    );

    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    // ------------------------------------------
    // Get Current Month Transactions
    // ------------------------------------------
    const transactions = await Transaction.find({
      user: req.userId,
      type: "expense",
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    });

    // ------------------------------------------
    // Calculate Total Monthly Expense
    // ------------------------------------------
    const totalMonthlyExpense = transactions.reduce(
      (total, transaction) => {
        return total + Number(transaction.amount || 0);
      },
      0
    );

    // ------------------------------------------
    // Monthly Budget
    // ------------------------------------------
    const monthlyBudget = Number(
      user.monthlyBudget || 0
    );

    // ------------------------------------------
    // Monthly Budget Percentage
    // ------------------------------------------
    const monthlyPercentage =
      monthlyBudget > 0
        ? (totalMonthlyExpense / monthlyBudget) * 100
        : 0;

    // ------------------------------------------
    // Alerts Array
    // ------------------------------------------
    const alerts = [];

    // ==========================================
    // Monthly Budget Exceeded
    // ==========================================
    if (
      monthlyBudget > 0 &&
      totalMonthlyExpense > monthlyBudget
    ) {
      alerts.push({
        id: "monthly-budget-exceeded",
        type: "danger",
        icon: "🚨",
        title: "Monthly budget exceeded",
        message: `You have exceeded your monthly budget by ₹${(
          totalMonthlyExpense - monthlyBudget
        ).toLocaleString("en-IN")}.`,
        budget: monthlyBudget,
        spent: totalMonthlyExpense,
        percentage: Number(
          monthlyPercentage.toFixed(2)
        ),
      });
    }

    // ==========================================
    // Monthly Budget 80% Alert
    // ==========================================
    else if (
      monthlyBudget > 0 &&
      monthlyPercentage >= 80
    ) {
      alerts.push({
        id: "monthly-budget-warning",
        type: "warning",
        icon: "⚠️",
        title: "Monthly budget almost reached",
        message: `You have used ${monthlyPercentage.toFixed(
          0
        )}% of your monthly budget.`,
        budget: monthlyBudget,
        spent: totalMonthlyExpense,
        percentage: Number(
          monthlyPercentage.toFixed(2)
        ),
      });
    }

    // ==========================================
    // Category Expense Calculation
    // ==========================================
    const categoryExpenses = {};

    transactions.forEach((transaction) => {
      const category =
        transaction.category?.trim() || "Other";

      if (!categoryExpenses[category]) {
        categoryExpenses[category] = 0;
      }

      categoryExpenses[category] += Number(
        transaction.amount || 0
      );
    });

    // ==========================================
    // Category Budget Alerts
    // ==========================================
    const categoryBudgets = user.categoryBudgets
      ? Object.fromEntries(user.categoryBudgets)
      : {};

    Object.entries(categoryBudgets).forEach(
      ([category, budgetAmount]) => {
        const budget = Number(budgetAmount || 0);

        const spent = Number(
          categoryExpenses[category] || 0
        );

        if (budget <= 0) {
          return;
        }

        const percentage =
          (spent / budget) * 100;

        // ------------------------------
        // Category Budget Exceeded
        // ------------------------------
        if (spent > budget) {
          alerts.push({
            id: `category-budget-exceeded-${category}`,
            type: "danger",
            icon: "💸",
            title: `${category} budget exceeded`,
            message: `You have exceeded your ${category} budget by ₹${(
              spent - budget
            ).toLocaleString("en-IN")}.`,
            category,
            budget,
            spent,
            percentage: Number(
              percentage.toFixed(2)
            ),
          });
        }

        // ------------------------------
        // Category Budget 80% Alert
        // ------------------------------
        else if (percentage >= 80) {
          alerts.push({
            id: `category-budget-warning-${category}`,
            type: "warning",
            icon: "⚠️",
            title: `${category} budget almost reached`,
            message: `You have used ${percentage.toFixed(
              0
            )}% of your ${category} budget.`,
            category,
            budget,
            spent,
            percentage: Number(
              percentage.toFixed(2)
            ),
          });
        }
      }
    );

    // ==========================================
    // Budget Status
    // ==========================================
    let budgetStatus = "safe";

    if (monthlyBudget > 0) {
      if (totalMonthlyExpense > monthlyBudget) {
        budgetStatus = "exceeded";
      } else if (monthlyPercentage >= 80) {
        budgetStatus = "warning";
      }
    }

    // ==========================================
    // Remaining Budget
    // ==========================================
    const remainingBudget =
      monthlyBudget > 0
        ? monthlyBudget - totalMonthlyExpense
        : 0;

    // ==========================================
    // Response
    // ==========================================
    return res.status(200).json({
      monthlyBudget,
      totalMonthlyExpense,

      remainingBudget,

      percentage: Number(
        monthlyPercentage.toFixed(2)
      ),

      budgetStatus,

      categoryExpenses,

      categoryBudgets,

      alerts,

      alertCount: alerts.length,

      month: now.toLocaleString("en-IN", {
        month: "long",
        year: "numeric",
      }),
    });
  } catch (error) {
    console.error(
      "Get Budget Alerts Error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching budget alerts",
    });
  }
};

// ==========================================
// Export Controllers
// ==========================================
module.exports = {
  getBudget,
  updateBudget,
  updateCategoryBudget,
  deleteCategoryBudget,
  getBudgetAlerts,
};