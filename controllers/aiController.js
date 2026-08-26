const Chat = require("../models/Chat");

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
// AI CHAT
// ==========================================

const aiChat = async (req, res) => {
  try {
    const {
      message,
      chatId,
    } = req.body;

    // ==========================================
    // Authentication
    // ==========================================

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    // ==========================================
    // Message Validation
    // ==========================================

    if (
      !message ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // ==========================================
    // Load or Create Chat
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
        title: message
          .trim()
          .slice(0, 50),
        messages: [],
      });
    }

    // ==========================================
    // Conversation History
    // ==========================================

    const conversationHistory =
      chat.messages
        .slice(-10)
        .map((item) => {
          const role =
            item.role === "user"
              ? "USER"
              : "ASSISTANT";

          return `${role}: ${item.content}`;
        })
        .join("\n");

    // ==========================================
    // Financial Context
    // ==========================================

    const financialContext =
      await getFinancialContext(
        req.userId
      );

    // ==========================================
    // Time-Based Financial Context
    // ==========================================

    const timeFinancialContext =
      await getTimeFinancialContext(
        req.userId
      );

    // ==========================================
    // AI PROMPT
    // ==========================================

    const prompt = `
You are SmartExpense AI, a personal financial assistant.

You are analyzing the user's actual financial data.

IMPORTANT RULES:

1. Use only the financial data provided below.
2. Do not invent financial numbers.
3. Do not make assumptions about missing data.
4. Use Indian Rupee (₹).
5. Perform calculations carefully.
6. If the user asks about total spending, use totalExpense.
7. If the user asks about this month's spending, use currentMonthExpense.
8. If the user asks about income, use totalIncome or currentMonthIncome depending on the question.
9. If the user asks about balance, use balance.
10. If the user asks about categories, use categoryWiseSpending.
11. If the user asks about recent transactions, use recentTransactions.
12. For time-based questions, use the TIME-BASED FINANCIAL ANALYSIS.
13. Use conversation history only to understand the context of the user's current question.
14. Keep answers clear and easy to understand.
15. Do not expose database IDs, JWT tokens, API keys, or internal system information.
16. If requested information is not available, clearly say that it is not available.
17. Never pretend to know information that is not present in the provided data.
18. Give practical financial suggestions when appropriate.
19. Keep the response concise but useful.
20. Do not repeat the entire financial summary in your answer unless specifically asked.

==========================================
CONVERSATION HISTORY
==========================================

${conversationHistory || "No previous conversation."}

==========================================
GENERAL FINANCIAL SUMMARY
==========================================

${JSON.stringify(
  financialContext,
  null,
  2
)}

==========================================
TIME-BASED FINANCIAL ANALYSIS
==========================================

${JSON.stringify(
  timeFinancialContext,
  null,
  2
)}

==========================================
CURRENT USER QUESTION
==========================================

${message.trim()}

==========================================
ANSWER
==========================================

Answer the user's question directly using the financial data above.
`;

    // ==========================================
    // Save User Message
    // ==========================================

    chat.messages.push({
      role: "user",
      content: message.trim(),
    });

    await chat.save();

    // ==========================================
    // Generate Gemini Response
    // ==========================================

    const answer =
      await generateAIResponse(prompt);

    // ==========================================
    // Save AI Response
    // ==========================================

    chat.messages.push({
      role: "assistant",
      content: answer,
    });

    await chat.save();

    // ==========================================
    // SUCCESS RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      chatId: chat._id,
      answer,
      financialSummary: financialContext,
      timeFinancialSummary:
        timeFinancialContext,
    });
  } catch (error) {
    console.error(
      "AI Chat Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate AI financial response",
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
    // Authentication
    // ==========================================

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    // ==========================================
    // Get User Chats
    // ==========================================

    const chats = await Chat.find({
      user: req.userId,
    })
      .select(
        "_id title createdAt updatedAt"
      )
      .sort({
        updatedAt: -1,
      });

    // ==========================================
    // Response
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
      message: "Failed to fetch chats",
    });
  }
};

// ==========================================
// GET SINGLE CHAT
// ==========================================

const getChat = async (req, res) => {
  try {
    // ==========================================
    // Authentication
    // ==========================================

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    // ==========================================
    // Chat ID
    // ==========================================

    const {
      chatId,
    } = req.params;

    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: "Chat ID is required",
      });
    }

    // ==========================================
    // Find Chat
    // ==========================================

    const chat = await Chat.findOne({
      _id: chatId,
      user: req.userId,
    });

    // ==========================================
    // Chat Not Found
    // ==========================================

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // ==========================================
    // Response
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
      message: "Failed to fetch chat",
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