const {
  GoogleGenerativeAI,
} = require("@google/generative-ai");

// ==========================================
// Gemini Configuration
// ==========================================

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

// ==========================================
// Generate AI Response
// ==========================================

const generateAIResponse = async (prompt) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error(
        "GEMINI_API_KEY is missing in .env"
      );
    }

    // ==========================================
    // Gemini Model
    // ==========================================

    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
    });

    // ==========================================
    // Generate Content
    // ==========================================

    const result =
      await model.generateContent(prompt);

    // ==========================================
    // Get Response
    // ==========================================

    const response = result.response;

    const text = response.text();

    if (!text) {
      throw new Error(
        "Gemini returned an empty response"
      );
    }

    return text;
  } catch (error) {
    console.error(
      "Gemini AI Error:",
      error
    );

    throw error;
  }
};

// ==========================================
// Export
// ==========================================

module.exports = {
  generateAIResponse,
};