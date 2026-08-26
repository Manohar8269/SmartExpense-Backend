const Transaction = require("../models/Transaction");

// ==========================================
// Get Financial Context
// ==========================================

const getFinancialContext = async (userId) => {
  try {
    // ==========================================
    // Get User Transactions
    // ==========================================

    const transactions =
      await Transaction.find({
        user: userId,
      }).sort({
        date: -1,
        createdAt: -1,
      });

    // ==========================================
    // Total Income & Expense
    // ==========================================

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(
      (transaction) => {
        const amount =
          Number(transaction.amount) || 0;

        if (transaction.type === "income") {
          totalIncome += amount;
        }

        if (transaction.type === "expense") {
          totalExpense += amount;
        }
      }
    );

    // ==========================================
    // Balance
    // ==========================================

    const balance =
      totalIncome - totalExpense;

    // ==========================================
    // Current Month
    // ==========================================

    const now = new Date();

    const currentMonth =
      now.getMonth();

    const currentYear =
      now.getFullYear();

    let currentMonthIncome = 0;
    let currentMonthExpense = 0;

    transactions.forEach(
      (transaction) => {
        const transactionDate =
          new Date(transaction.date);

        if (
          transactionDate.getMonth() ===
            currentMonth &&
          transactionDate.getFullYear() ===
            currentYear
        ) {
          const amount =
            Number(transaction.amount) || 0;

          if (
            transaction.type ===
            "income"
          ) {
            currentMonthIncome += amount;
          }

          if (
            transaction.type ===
            "expense"
          ) {
            currentMonthExpense += amount;
          }
        }
      }
    );

    // ==========================================
    // Category Wise Spending
    // ==========================================

    const categoryWiseSpending = {};

    transactions.forEach(
      (transaction) => {
        if (
          transaction.type !==
          "expense"
        ) {
          return;
        }

        const category =
          transaction.category ||
          "Other";

        const amount =
          Number(transaction.amount) || 0;

        if (
          !categoryWiseSpending[
            category
          ]
        ) {
          categoryWiseSpending[
            category
          ] = 0;
        }

        categoryWiseSpending[
          category
        ] += amount;
      }
    );

    // ==========================================
    // Sort Categories
    // ==========================================

    const sortedCategoryWiseSpending =
      Object.entries(
        categoryWiseSpending
      )
        .sort(
          (a, b) => b[1] - a[1]
        )
        .reduce(
          (obj, [category, amount]) => {
            obj[category] = amount;
            return obj;
          },
          {}
        );

    // ==========================================
    // Recent Transactions
    // ==========================================

    const recentTransactions =
      transactions
        .slice(0, 10)
        .map((transaction) => ({
          type: transaction.type,
          amount:
            Number(transaction.amount) ||
            0,
          category:
            transaction.category,
          date: transaction.date,
          description:
            transaction.description ||
            "",
        }));

    // ==========================================
    // Expense Percentage
    // ==========================================

    let expensePercentage = 0;

    if (totalIncome > 0) {
      expensePercentage =
        (totalExpense /
          totalIncome) *
        100;
    }

    // ==========================================
    // Return Context
    // ==========================================

    return {
      totalIncome,
      totalExpense,
      balance,

      currentMonthIncome,
      currentMonthExpense,

      categoryWiseSpending:
        sortedCategoryWiseSpending,

      recentTransactions,

      totalTransactions:
        transactions.length,

      expensePercentage:
        Number(
          expensePercentage.toFixed(2)
        ),
    };
  } catch (error) {
    console.error(
      "Financial Context Error:",
      error
    );

    throw error;
  }
};

// ==========================================
// Export
// ==========================================

module.exports = {
  getFinancialContext,
};