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
// Gemini Model
// ==========================================

const MODEL_NAME =
  process.env.GEMINI_MODEL || "gemini-3.6-flash";

// ==========================================
// Generate AI Response
// ==========================================

const generateAIResponse = async ({
  message,
  financialContext = "",
  timeContext = "",
}) => {
  try {
    // ==========================================
    // API Key Validation
    // ==========================================

    if (!process.env.GEMINI_API_KEY) {
      throw new Error(
        "GEMINI_API_KEY is missing in .env"
      );
    }

    // ==========================================
    // Message Validation
    // ==========================================

    if (!message || !message.trim()) {
      throw new Error(
        "User message is required for Gemini"
      );
    }

    // ==========================================
    // Gemini Model
    // ==========================================

    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
    });

    // ==========================================
    // Smart Financial AI Prompt
    // ==========================================

    const prompt = `
You are SmartExpense AI, an intelligent personal
finance assistant.

Your job is to analyze the user's financial data
and provide useful, practical, personalized advice.

==========================================
USER QUESTION
==========================================

${message}

==========================================
FINANCIAL CONTEXT
==========================================

${
  financialContext ||
  "No financial context is available."
}

==========================================
TIME FINANCIAL CONTEXT
==========================================

${
  timeContext ||
  "No time-based financial context is available."
}

==========================================
IMPORTANT INSTRUCTIONS
==========================================

1. Answer the user's exact question.

2. Use the financial context provided above
   whenever it is relevant.

3. Never invent financial numbers.

4. Never assume income, expenses, balance,
   transactions, categories or dates that are
   not present in the provided context.

5. If a required financial detail is unavailable,
   clearly say that the information is unavailable.

6. Give personalized recommendations instead of
   generic financial advice whenever sufficient
   user data is available.

7. If you identify a high spending category,
   explain it clearly.

8. If you identify unusual or abnormal spending,
   mention it and explain why it may be important.

9. If the user's spending appears excessive,
   suggest realistic ways to reduce it.

10. If the user asks about saving money,
    provide actionable saving strategies based
    on their actual spending.

11. If the user asks about spending patterns,
    analyze trends, categories, frequency and
    noticeable spending behavior from the
    provided context.

12. Keep the answer easy to understand.

13. Use Indian Rupee notation (₹) when discussing
    Indian currency.

14. Do not claim that you performed an action
    that you did not perform.

15. Do not access or assume external financial
    information.

16. Do not give a simple database calculation
    when the question requires actual reasoning.
    Focus on analysis and recommendations.

17. Keep the response reasonably concise.
    Avoid unnecessary long explanations.

==========================================
RESPONSE STYLE
==========================================

- Be helpful and professional.
- Use short paragraphs.
- Use bullet points when useful.
- Mention important numbers when available.
- Give clear actionable suggestions.
- Do not repeat the user's question unnecessarily.

Now analyze the user's financial context and
answer their question.
`;

    // ==========================================
    // Generate Content
    // ==========================================

    const result =
      await model.generateContent(prompt);

    // ==========================================
    // Get Gemini Response
    // ==========================================

    const response = result.response;

    const text = response.text();

    // ==========================================
    // Empty Response Check
    // ==========================================

    if (!text || !text.trim()) {
      throw new Error(
        "Gemini returned an empty response"
      );
    }

    // ==========================================
    // Return Clean Response
    // ==========================================

    return text.trim();
  } catch (error) {
    // ==========================================
    // Gemini Error Handling
    // ==========================================

    console.error(
      "Gemini AI Error:",
      error.message || error
    );

    // ==========================================
    // Rate Limit / Quota Error
    // ==========================================

    if (
      error.message &&
      (
        error.message.includes("429") ||
        error.message.includes("Too Many Requests") ||
        error.message.includes("quota")
      )
    ) {
      throw new Error(
        "Gemini API quota/rate limit exceeded. " +
        "Please try again later."
      );
    }

    // ==========================================
    // Authentication Error
    // ==========================================

    if (
      error.message &&
      (
        error.message.includes("401") ||
        error.message.includes("403") ||
        error.message.includes("API key")
      )
    ) {
      throw new Error(
        "Gemini API authentication failed. " +
        "Please check GEMINI_API_KEY in .env."
      );
    }

    // ==========================================
    // Model Error
    // ==========================================

    if (
      error.message &&
      (
        error.message.includes("404") ||
        error.message.includes("not found") ||
        error.message.includes("model")
      )
    ) {
      throw new Error(
        `Gemini model "${MODEL_NAME}" is unavailable. ` +
        "Please check GEMINI_MODEL in .env."
      );
    }

    // ==========================================
    // Re-throw Other Errors
    // ==========================================

    throw error;
  }
};

// ==========================================
// Export
// ==========================================

module.exports = {
  generateAIResponse,
};