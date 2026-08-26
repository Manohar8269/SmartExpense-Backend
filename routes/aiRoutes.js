const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  testAI,
  aiChat,
  getChats,
  getChat,
} = require("../controllers/aiController");

// ==========================================
// Public AI Test Endpoint
// ==========================================

router.post("/test", testAI);

// ==========================================
// Protected AI Chat Endpoint
// ==========================================

router.post("/chat", protect,aiChat);

router.get("/chats", protect, getChats);

router.get("/chats/:chatId", protect, getChat);


// ==========================================
// Export
// ==========================================

module.exports = router;