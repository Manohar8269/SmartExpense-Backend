const Transaction = require("../models/Transaction");

// ==========================================
// Get Time-Based Financial Context
// ==========================================

const getTimeFinancialContext = async (
  userId
) => {
  try {
    // ==========================================
    // Get Transactions
    // ==========================================

    const transactions =
      await Transaction.find({
        user: userId,
      }).sort({
        date: -1,
        createdAt: -1,
      });

    // ==========================================
    // Date Helpers
    // ==========================================

    const now = new Date();

    const currentYear =
      now.getFullYear();

    const currentMonth =
      now.getMonth();

    // ==========================================
    // Last 7 Days
    // ==========================================

    const last7DaysDate =
      new Date(now);

    last7DaysDate.setDate(
      now.getDate() - 7
    );

    let last7DaysExpense = 0;
    let last7DaysIncome = 0;

    // ==========================================
    // Last 30 Days
    // ==========================================

    const last30DaysDate =
      new Date(now);

    last30DaysDate.setDate(
      now.getDate() - 30
    );

    let last30DaysExpense = 0;
    let last30DaysIncome = 0;

    // ==========================================
    // Current Month
    // ==========================================

    let currentMonthExpense = 0;
    let currentMonthIncome = 0;

    // ==========================================
    // Previous Month
    // ==========================================

    let previousMonthExpense = 0;
    let previousMonthIncome = 0;

    const previousMonth =
      currentMonth === 0
        ? 11
        : currentMonth - 1;

    const previousMonthYear =
      currentMonth === 0
        ? currentYear - 1
        : currentYear;

    // ==========================================
    // Process Transactions
    // ==========================================

    transactions.forEach(
      (transaction) => {
        const date =
          new Date(transaction.date);

        const amount =
          Number(transaction.amount) || 0;

        // ------------------------------
        // Last 7 Days
        // ------------------------------

        if (date >= last7DaysDate) {
          if (
            transaction.type ===
            "expense"
          ) {
            last7DaysExpense += amount;
          }

          if (
            transaction.type ===
            "income"
          ) {
            last7DaysIncome += amount;
          }
        }

        // ------------------------------
        // Last 30 Days
        // ------------------------------

        if (date >= last30DaysDate) {
          if (
            transaction.type ===
            "expense"
          ) {
            last30DaysExpense += amount;
          }

          if (
            transaction.type ===
            "income"
          ) {
            last30DaysIncome += amount;
          }
        }

        // ------------------------------
        // Current Month
        // ------------------------------

        if (
          date.getMonth() ===
            currentMonth &&
          date.getFullYear() ===
            currentYear
        ) {
          if (
            transaction.type ===
            "expense"
          ) {
            currentMonthExpense += amount;
          }

          if (
            transaction.type ===
            "income"
          ) {
            currentMonthIncome += amount;
          }
        }

        // ------------------------------
        // Previous Month
        // ------------------------------

        if (
          date.getMonth() ===
            previousMonth &&
          date.getFullYear() ===
            previousMonthYear
        ) {
          if (
            transaction.type ===
            "expense"
          ) {
            previousMonthExpense +=
              amount;
          }

          if (
            transaction.type ===
            "income"
          ) {
            previousMonthIncome +=
              amount;
          }
        }
      }
    );

    // ==========================================
    // Average Daily Expense
    // ==========================================

    const averageDailyExpense =
      last30DaysExpense / 30;

    // ==========================================
    // Monthly Expense Change
    // ==========================================

    let monthlyExpenseChange = 0;

    if (previousMonthExpense > 0) {
      monthlyExpenseChange =
        ((currentMonthExpense -
          previousMonthExpense) /
          previousMonthExpense) *
        100;
    }

    // ==========================================
    // Spending Trend
    // ==========================================

    let spendingTrend =
      "stable";

    if (
      monthlyExpenseChange > 10
    ) {
      spendingTrend =
        "increasing";
    } else if (
      monthlyExpenseChange < -10
    ) {
      spendingTrend =
        "decreasing";
    }

    // ==========================================
    // Return Context
    // ==========================================

    return {
      last7DaysExpense,
      last7DaysIncome,

      last30DaysExpense,
      last30DaysIncome,

      currentMonthExpense,
      currentMonthIncome,

      previousMonthExpense,
      previousMonthIncome,

      averageDailyExpense:
        Number(
          averageDailyExpense.toFixed(
            2
          )
        ),

      monthlyExpenseChange:
        Number(
          monthlyExpenseChange.toFixed(
            2
          )
        ),

      spendingTrend,

      analysisDate: now,
    };
  } catch (error) {
    console.error(
      "Time Financial Context Error:",
      error
    );

    throw error;
  }
};

// ==========================================
// Export
// ==========================================

module.exports = {
  getTimeFinancialContext,
};