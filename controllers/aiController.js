const mongoose = require("mongoose");

const Chat = require("../models/Chat");

const {
  detectFinancialIntent,
} = require("../services/intentService");

const {
  generateAIResponse,
} = require("../services/geminiService");

const {
  getFinancialContext,
} = require("../services/financialContextService");

const {
  getTimeFinancialContext,
} = require("../services/timeFinancialService");

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const formatINR = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "0";
  }

  return amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
};

const safeNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

// ==========================================
// AI CHAT
// ==========================================

const aiChat = async (req, res) => {
  try {
    const { message, chatId } = req.body;

    // ==========================================
    // AUTHENTICATION
    // ==========================================

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    // ==========================================
    // MESSAGE VALIDATION
    // ==========================================

    if (
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const userMessage = message.trim();

    // ==========================================
    // CHAT ID VALIDATION
    // ==========================================

    if (
      chatId &&
      !mongoose.Types.ObjectId.isValid(chatId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid chat ID",
      });
    }

    // ==========================================
    // DETECT FINANCIAL INTENT
    // ==========================================
    //
    // New intentService returns:
    //
    // {
    //   intent: "TOTAL_EXPENSE",
    //   requiresAI: false
    // }
    //
    // OR
    //
    // {
    //   intent: "SPENDING_ADVICE",
    //   requiresAI: true
    // }
    // ==========================================

    const detectedIntent =
      detectFinancialIntent(userMessage);

    const intent =
      detectedIntent?.intent ||
      "GENERAL_FINANCIAL";

    const requiresAI =
      detectedIntent?.requiresAI === true;

    console.log(
      "=========================================="
    );

    console.log(
      "User Question:",
      userMessage
    );

    console.log(
      "Detected Financial Intent:",
      intent
    );

    console.log(
      "Requires Gemini AI:",
      requiresAI
    );

    console.log(
      "=========================================="
    );

    // ==========================================
    // LOAD OR CREATE CHAT
    // ==========================================

    let chat;

    if (chatId) {
      chat = await Chat.findOne({
        _id: chatId,
        user: req.userId,
      });

      if (!chat) {
        return res.status(404).json({
          success: false,
          message: "Chat not found",
        });
      }
    } else {
      chat = await Chat.create({
        user: req.userId,
        title: userMessage.slice(0, 50),
        messages: [],
      });
    }

    // ==========================================
    // CONVERSATION HISTORY
    // ==========================================

    const conversationHistory =
      Array.isArray(chat.messages)
        ? chat.messages
            .slice(-10)
            .map((item) => {
              const role =
                item.role === "user"
                  ? "USER"
                  : "ASSISTANT";

              return `${role}: ${item.content}`;
            })
            .join("\n")
        : "No previous conversation.";

    // ==========================================
    // FINANCIAL CONTEXT
    // ==========================================

    const financialContext =
      (await getFinancialContext(req.userId)) || {};

    // ==========================================
    // TIME FINANCIAL CONTEXT
    // ==========================================

    const timeFinancialContext =
      (await getTimeFinancialContext(
        req.userId
      )) || {};

    // ==========================================
    // SAVE USER MESSAGE
    // ==========================================

    chat.messages.push({
      role: "user",
      content: userMessage,
    });

    await chat.save();

    // ==========================================
    // DIRECT FINANCIAL ANSWERS
    // ==========================================
    //
    // IMPORTANT:
    //
    // requiresAI = false
    //
    // Gemini will NOT be called.
    //
    // ==========================================

    let directAnswer = null;

    // ==========================================
    // TOTAL EXPENSE
    // ==========================================

    switch (intent) {
      case "TOTAL_EXPENSE": {
        const totalExpense = safeNumber(
          financialContext.totalExpense
        );

        directAnswer =
          `Aapka kul kharcha (Total Expense) ₹${formatINR(
            totalExpense
          )} hai.`;

        break;
      }

      // ==========================================
      // TOTAL INCOME
      // ==========================================

      case "TOTAL_INCOME": {
        const totalIncome = safeNumber(
          financialContext.totalIncome
        );

        directAnswer =
          `Aapki kul aamdani (Total Income) ₹${formatINR(
            totalIncome
          )} hai.`;

        break;
      }

      // ==========================================
      // SAVINGS
      // ==========================================

      case "SAVINGS": {
        const totalIncome = safeNumber(
          financialContext.totalIncome
        );

        const totalExpense = safeNumber(
          financialContext.totalExpense
        );

        const calculatedSavings =
          totalIncome - totalExpense;

        const balance = safeNumber(
          financialContext.balance
        );

        const savings =
          Number.isFinite(calculatedSavings)
            ? calculatedSavings
            : balance;

        directAnswer =
          `Aapki bachi hui rakam (Savings) ₹${formatINR(
            savings
          )} hai.`;

        break;
      }

      // ==========================================
      // BALANCE
      // ==========================================

      case "BALANCE": {
        const balance = safeNumber(
          financialContext.balance
        );

        directAnswer =
          `Aapke paas abhi ₹${formatINR(
            balance
          )} ka balance hai.`;

        break;
      }

      // ==========================================
      // MONTHLY EXPENSE
      // ==========================================

      case "MONTHLY_EXPENSE": {
        const currentMonthExpense =
          safeNumber(
            financialContext.currentMonthExpense
          );

        directAnswer =
          `Is mahine aapka kul kharcha ₹${formatINR(
            currentMonthExpense
          )} hai.`;

        break;
      }

      // ==========================================
      // MONTHLY INCOME
      // ==========================================

      case "MONTHLY_INCOME": {
        const currentMonthIncome =
          safeNumber(
            financialContext.currentMonthIncome
          );

        directAnswer =
          `Is mahine aapki kul aamdani ₹${formatINR(
            currentMonthIncome
          )} hai.`;

        break;
      }

      // ==========================================
      // LAST 7 DAYS EXPENSE
      // ==========================================

      case "LAST_7_DAYS_EXPENSE": {
        const expense = safeNumber(
          timeFinancialContext.last7DaysExpense
        );

        directAnswer =
          `Pichhle 7 dinon mein aapka kul kharcha ₹${formatINR(
            expense
          )} hai.`;

        break;
      }

      // ==========================================
      // LAST 30 DAYS EXPENSE
      // ==========================================

      case "LAST_30_DAYS_EXPENSE": {
        const expense = safeNumber(
          timeFinancialContext.last30DaysExpense
        );

        directAnswer =
          `Pichhle 30 dinon mein aapka kul kharcha ₹${formatINR(
            expense
          )} hai.`;

        break;
      }

      // ==========================================
      // CATEGORY EXPENSE
      // ==========================================

      case "CATEGORY_EXPENSE": {
        const categories =
          financialContext.categoryWiseSpending ||
          {};

        const categoryEntries =
          Object.entries(categories)
            .filter(
              ([, amount]) =>
                Number.isFinite(Number(amount))
            )
            .sort(
              ([, amountA], [, amountB]) =>
                Number(amountB) -
                Number(amountA)
            );

        if (categoryEntries.length === 0) {
          directAnswer =
            "Abhi category-wise expense data available nahi hai.";
        } else {
          const categoryText =
            categoryEntries
              .slice(0, 5)
              .map(
                ([category, amount], index) =>
                  `${index + 1}. ${category}: ₹${formatINR(
                    amount
                  )}`
              )
              .join("\n");

          directAnswer =
            `Aapke category-wise expenses:\n\n${categoryText}`;
        }

        break;
      }

      // ==========================================
      // TOP EXPENSE CATEGORY
      // ==========================================

      case "TOP_CATEGORY": {
        const categories =
          financialContext.categoryWiseSpending ||
          {};

        const categoryEntries =
          Object.entries(categories)
            .filter(
              ([, amount]) =>
                Number.isFinite(Number(amount))
            )
            .sort(
              ([, amountA], [, amountB]) =>
                Number(amountB) -
                Number(amountA)
            );

        if (categoryEntries.length === 0) {
          directAnswer =
            "Abhi category-wise expense data available nahi hai.";
        } else {
          const [
            topCategory,
            topAmount,
          ] = categoryEntries[0];

          directAnswer =
            `Aapki sabse zyada spending "${topCategory}" category mein hai, jiska kharcha ₹${formatINR(
              topAmount
            )} hai.`;
        }

        break;
      }

      // ==========================================
      // DAILY SPENDING LIMIT
      // ==========================================

      case "DAILY_LIMIT": {
        const balance = safeNumber(
          financialContext.balance
        );

        const today = new Date();

        const daysInMonth =
          new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0
          ).getDate();

        const currentDay =
          today.getDate();

        const daysRemaining =
          Math.max(
            daysInMonth - currentDay + 1,
            1
          );

        const dailyLimit =
          balance > 0
            ? balance / daysRemaining
            : 0;

        directAnswer =
          `Aapke paas ₹${formatINR(
            balance
          )} balance hai aur is mahine ke lagbhag ${daysRemaining} din bache hain.\n\n` +
          `Aap approximately ₹${formatINR(
            dailyLimit
          )} per day kharch kar sakte hain.`;

        break;
      }

      // ==========================================
      // BUDGET
      // ==========================================

      case "BUDGET": {
        const monthlyBudget = safeNumber(
          financialContext.monthlyBudget
        );

        const currentMonthExpense =
          safeNumber(
            financialContext.currentMonthExpense
          );

        if (
          monthlyBudget <= 0 &&
          currentMonthExpense <= 0
        ) {
          directAnswer =
            "Abhi budget-related data available nahi hai.";
        } else if (monthlyBudget <= 0) {
          directAnswer =
            `Is mahine aapka expense ₹${formatINR(
              currentMonthExpense
            )} hai, lekin monthly budget set nahi hai.`;
        } else {
          const remaining =
            monthlyBudget -
            currentMonthExpense;

          const usedPercentage =
            monthlyBudget > 0
              ? (currentMonthExpense /
                  monthlyBudget) *
                100
              : 0;

          directAnswer =
            `Aapka monthly budget ₹${formatINR(
              monthlyBudget
            )} hai.\n` +
            `Abhi tak ₹${formatINR(
              currentMonthExpense
            )} spend hua hai.\n` +
            `Remaining budget ₹${formatINR(
              remaining
            )} hai.\n` +
            `Budget usage ${usedPercentage.toFixed(
              1
            )}% hai.`;
        }

        break;
      }

      // ==========================================
      // RECENT TRANSACTIONS
      // ==========================================

      case "RECENT_TRANSACTIONS": {
        const recentTransactions =
          Array.isArray(
            financialContext.recentTransactions
          )
            ? financialContext.recentTransactions
            : [];

        if (
          recentTransactions.length === 0
        ) {
          directAnswer =
            "Abhi recent transaction data available nahi hai.";
        } else {
          const transactionText =
            recentTransactions
              .slice(0, 5)
              .map((transaction, index) => {
                const category =
                  transaction.category ||
                  transaction.customCategory ||
                  "Unknown";

                const amount = safeNumber(
                  transaction.amount
                );

                return `${index + 1}. ${category}: ₹${formatINR(
                  amount
                )}`;
              })
              .join("\n");

          directAnswer =
            `Aapke recent transactions:\n\n${transactionText}`;
        }

        break;
      }

      // ==========================================
      // ABNORMAL EXPENSE
      // ==========================================

      case "ABNORMAL_EXPENSE": {
        const abnormalExpenses =
          Array.isArray(
            financialContext.abnormalExpenses
          )
            ? financialContext.abnormalExpenses
            : [];

        if (
          abnormalExpenses.length === 0
        ) {
          directAnswer =
            "Abhi abnormal expense identify karne ke liye sufficient data available nahi hai.";
        } else {
          const abnormalText =
            abnormalExpenses
              .slice(0, 5)
              .map((transaction, index) => {
                const category =
                  transaction.category ||
                  transaction.customCategory ||
                  "Unknown";

                const amount = safeNumber(
                  transaction.amount
                );

                return `${index + 1}. ${category}: ₹${formatINR(
                  amount
                )}`;
              })
              .join("\n");

          directAnswer =
            `Mujhe ye unusual expenses mile:\n\n${abnormalText}`;
        }

        break;
      }

      // ==========================================
      // FORECAST
      // ==========================================

      case "FORECAST": {
        const projectedMonthEndExpense =
          safeNumber(
            timeFinancialContext.projectedMonthEndExpense ??
              financialContext.projectedMonthEndExpense
          );

        const currentMonthExpense =
          safeNumber(
            financialContext.currentMonthExpense
          );

        const averageDailyExpense =
          safeNumber(
            timeFinancialContext.averageDailyExpense ??
              financialContext.averageDailyExpense
          );

        if (
          projectedMonthEndExpense > 0
        ) {
          directAnswer =
            `Abhi is mahine ka expense ₹${formatINR(
              currentMonthExpense
            )} hai.\n\n` +
            `Aapke current spending pattern ke basis par month-end expense approximately ₹${formatINR(
              projectedMonthEndExpense
            )} ho sakta hai.\n\n` +
            `Average daily spending ₹${formatINR(
              averageDailyExpense
            )} hai.`;
        } else {
          directAnswer =
            "Abhi expense forecast ke liye sufficient data available nahi hai.";
        }

        break;
      }

      // ==========================================
      // MONTHLY ANALYSIS
      // ==========================================

      case "MONTHLY_ANALYSIS": {
        const currentMonthExpense =
          safeNumber(
            financialContext.currentMonthExpense
          );

        const previousMonthExpense =
          safeNumber(
            financialContext.previousMonthExpense
          );

        const monthlyExpenseChange =
          safeNumber(
            financialContext.monthlyExpenseChange
          );

        const spendingTrend =
          financialContext.spendingTrend ||
          null;

        if (
          currentMonthExpense <= 0 &&
          previousMonthExpense <= 0
        ) {
          directAnswer =
            "Monthly analysis ke liye abhi sufficient expense data available nahi hai.";
        } else {
          let trendText =
            "Spending trend available nahi hai.";

          if (spendingTrend) {
            trendText =
              `Spending trend: ${spendingTrend}`;
          } else if (
            monthlyExpenseChange > 0
          ) {
            trendText =
              `Previous month ke comparison mein expense ₹${formatINR(
                monthlyExpenseChange
              )} increase hua hai.`;
          } else if (
            monthlyExpenseChange < 0
          ) {
            trendText =
              `Previous month ke comparison mein expense ₹${formatINR(
                Math.abs(
                  monthlyExpenseChange
                )
              )} decrease hua hai.`;
          }

          directAnswer =
            `Current month expense: ₹${formatINR(
              currentMonthExpense
            )}\n` +
            `Previous month expense: ₹${formatINR(
              previousMonthExpense
            )}\n` +
            `${trendText}`;
        }

        break;
      }

      // ==========================================
      // DEFAULT
      // ==========================================

      default:
        directAnswer = null;
    }

    // ==========================================
    // RETURN DIRECT ANSWER
    // ==========================================
    //
    // If directAnswer exists:
    // Gemini is completely skipped.
    // ==========================================

    if (directAnswer) {
      chat.messages.push({
        role: "assistant",
        content: directAnswer,
      });

      await chat.save();

      console.log(
        "Response Type: DIRECT"
      );

      console.log(
        "Gemini Called: NO"
      );

      return res.status(200).json({
        success: true,
        chatId: chat._id,
        answer: directAnswer,
        response: directAnswer,

        financialSummary:
          financialContext,

        timeFinancialSummary:
          timeFinancialContext,

        intent,
        requiresAI: false,
      });
    }

    // ==========================================
    // AI REASONING
    // ==========================================
    //
    // Only reaches here when no direct answer
    // exists.
    //
    // For example:
    //
    // SPENDING_ADVICE
    // SPENDING_PATTERN
    // SAVING_ADVICE
    // BUDGET_ADVICE
    // FINANCIAL_ANALYSIS
    // GENERAL_FINANCIAL
    //
    // ==========================================

    console.log(
      "Response Type: AI REASONING"
    );

    console.log(
      "Gemini Called: YES"
    );

    // ==========================================
    // CREATE AI PROMPT
    // ==========================================

    const prompt = `
You are SmartExpense AI, an intelligent personal
finance assistant.

Your task is to answer the user's question using
their actual financial data.

==========================================
DETECTED FINANCIAL INTENT
==========================================

${intent}

==========================================
CURRENT USER QUESTION
==========================================

${userMessage}

==========================================
CONVERSATION HISTORY
==========================================

${conversationHistory}

==========================================
FINANCIAL CONTEXT
==========================================

${JSON.stringify(
  financialContext,
  null,
  2
)}

==========================================
TIME FINANCIAL CONTEXT
==========================================

${JSON.stringify(
  timeFinancialContext,
  null,
  2
)}

==========================================
IMPORTANT INSTRUCTIONS
==========================================

1. Answer the user's exact question.

2. Use the financial context provided above.

3. Never invent financial numbers.

4. Never assume financial information that is
   not available in the provided context.

5. If required information is unavailable,
   clearly explain that it is unavailable.

6. Give personalized advice based on the user's
   actual financial data.

7. If the user asks how to control expenses,
   identify the areas where spending can be reduced.

8. If the user asks about spending patterns,
   analyze their spending behavior, categories,
   trends and frequency when data is available.

9. If the user asks about saving money,
   provide realistic saving strategies based on
   their actual income and expenses.

10. If the user asks for financial analysis,
    explain their financial situation clearly.

11. If abnormal spending is visible in the data,
    mention it when relevant.

12. Use ₹ for Indian currency.

13. Do not expose database IDs, API keys,
    authentication tokens or internal system data.

14. Do not mention internal intent names.

15. Do not pretend to perform an action that
    you did not perform.

16. Do not repeat the complete financial context
    unnecessarily.

17. Keep the response concise but useful.

18. Use bullet points when they make the answer
    easier to understand.

19. Give practical and actionable recommendations.

20. Answer in the same language/style as the user
    whenever reasonably possible.

==========================================
FINAL RESPONSE
==========================================

Provide a clear, personalized and practical
answer to the user's question.
`;

    // ==========================================
    // GENERATE GEMINI RESPONSE
    // ==========================================

    let aiResponse;

try {
  aiResponse = await generateAIResponse({
    message: userMessage,
    financialContext,
    timeContext: timeFinancialContext,
  });
} catch (geminiError) {
      console.error(
        "Gemini Generation Error:",
        geminiError.message ||
          geminiError
      );

      // ========================================
      // Remove user message if AI failed?
      // ========================================
      //
      // We keep conversation history intact.
      // Instead, send a clean error response.
      // ========================================

      const errorMessage =
        geminiError.message ||
        "Gemini AI response could not be generated.";

      chat.messages.push({
        role: "assistant",
        content:
          `Sorry, abhi AI response generate nahi ho pa raha hai. ${errorMessage}`,
      });

      await chat.save();

      return res.status(503).json({
        success: false,
        chatId: chat._id,
        message:
          "AI service is temporarily unavailable",
        error: errorMessage,
        intent,
        requiresAI: true,
      });
    }

    // ==========================================
    // VALIDATE AI RESPONSE
    // ==========================================

    const finalAnswer =
      typeof aiResponse === "string" &&
      aiResponse.trim()
        ? aiResponse.trim()
        : "Sorry, mujhe abhi response generate karne mein problem aa rahi hai.";

    // ==========================================
    // SAVE AI RESPONSE
    // ==========================================

    chat.messages.push({
      role: "assistant",
      content: finalAnswer,
    });

    await chat.save();

    // ==========================================
    // SUCCESS RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      chatId: chat._id,
      answer: finalAnswer,
      response: finalAnswer,

      financialSummary:
        financialContext,

      timeFinancialSummary:
        timeFinancialContext,

      intent,
      requiresAI: true,
    });
  } catch (error) {
    // ==========================================
    // MAIN ERROR HANDLER
    // ==========================================

    console.error(
      "AI Chat Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate AI financial response",
      error: error.message,
    });
  }
};

// ==========================================
// TEST AI
// ==========================================

const testAI = async (req, res) => {
  return res.status(200).json({
    success: true,
    message:
      "SmartExpense AI backend is working",
  });
};

// ==========================================
// GET ALL CHATS
// ==========================================

const getChats = async (req, res) => {
  try {
    // ==========================================
    // AUTHENTICATION
    // ==========================================

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message:
          "User authentication required",
      });
    }

    // ==========================================
    // GET USER CHATS
    // ==========================================

    const chats = await Chat.find({
      user: req.userId,
    })
      .select(
        "_id title createdAt updatedAt"
      )
      .sort({
        updatedAt: -1,
      })
      .lean();

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      chats,
    });
  } catch (error) {
    console.error(
      "Get Chats Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch chats",
    });
  }
};

// ==========================================
// GET SINGLE CHAT
// ==========================================

const getChat = async (req, res) => {
  try {
    // ==========================================
    // AUTHENTICATION
    // ==========================================

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message:
          "User authentication required",
      });
    }

    // ==========================================
    // CHAT ID
    // ==========================================

    const { chatId } = req.params;

    if (!chatId) {
      return res.status(400).json({
        success: false,
        message:
          "Chat ID is required",
      });
    }

    // ==========================================
    // VALIDATE CHAT ID
    // ==========================================

    if (
      !mongoose.Types.ObjectId.isValid(
        chatId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid chat ID",
      });
    }

    // ==========================================
    // FIND CHAT
    // ==========================================

    const chat = await Chat.findOne({
      _id: chatId,
      user: req.userId,
    }).lean();

    // ==========================================
    // CHAT NOT FOUND
    // ==========================================

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      chat,
    });
  } catch (error) {
    console.error(
      "Get Chat Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch chat",
    });
  }
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  testAI,
  aiChat,
  getChats,
  getChat,
};