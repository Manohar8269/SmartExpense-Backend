// ==========================================
// Financial Intent Detection Service
// ==========================================

const detectFinancialIntent = (message = "") => {
  const text = String(message)
    .toLowerCase()
    .trim();

  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================

  const direct = (intent) => ({
    intent,
    requiresAI: false,
  });

  const ai = (intent) => ({
    intent,
    requiresAI: true,
  });

  // ==========================================
  // EMPTY MESSAGE
  // ==========================================

  if (!text) {
    return ai("GENERAL_FINANCIAL");
  }

  // ==========================================
  // 1. AI REASONING
  // ==========================================
  //
  // IMPORTANT:
  // AI reasoning checks MUST come before
  // generic expense/spending checks.
  //
  // ==========================================


  // ==========================================
  // 1.1 Spending Control / Expense Reduction
  // ==========================================

  if (
    // English
    text.includes("control my expense") ||
    text.includes("control my expenses") ||
    text.includes("control expenses") ||
    text.includes("control spending") ||
    text.includes("reduce my expense") ||
    text.includes("reduce my expenses") ||
    text.includes("reduce expenses") ||
    text.includes("reduce spending") ||
    text.includes("manage my expense") ||
    text.includes("manage my expenses") ||
    text.includes("manage expenses") ||
    text.includes("manage spending") ||
    text.includes("optimize my expenses") ||
    text.includes("optimize expenses") ||
    text.includes("cut my expenses") ||
    text.includes("cut expenses") ||
    text.includes("lower my expenses") ||
    text.includes("lower expenses") ||
    text.includes("expense control") ||
    text.includes("expense reduction") ||
    text.includes("spending control") ||
    text.includes("how to reduce expenses") ||
    text.includes("how can i reduce expenses") ||
    text.includes("how to control expenses") ||
    text.includes("how can i control expenses") ||

    // Hinglish
    text.includes("expenses ko control") ||
    text.includes("expense ko control") ||
    text.includes("expense control kaise") ||
    text.includes("expenses control kaise") ||
    text.includes("expenses kaise control") ||
    text.includes("expense kaise control") ||
    text.includes("expenses kam") ||
    text.includes("expense kam") ||
    text.includes("expenses kaise kam") ||
    text.includes("expense kaise kam") ||
    text.includes("expense kasa kam") ||
    text.includes("expense kasa kaam") ||
    text.includes("expenses kasa kam") ||
    text.includes("expenses kasa kaam") ||
    text.includes("expence kam") ||
    text.includes("expence kaise kam") ||
    text.includes("expence kasa kam") ||
    text.includes("expence kasa kaam") ||
    text.includes("expences kam") ||
    text.includes("expences kaise kam") ||
    text.includes("expences kasa kam") ||
    text.includes("expences kasa kaam") ||
    text.includes("kharcha kam") ||
    text.includes("kharch kam") ||
    text.includes("kharcha kaise kam") ||
    text.includes("kharch kaise kam") ||
    text.includes("kharcha kasa kam") ||
    text.includes("kharch kasa kam") ||
    text.includes("kharcha kasa kaam") ||
    text.includes("kharch kasa kaam") ||
    text.includes("kharcha control") ||
    text.includes("kharch control") ||
    text.includes("kharcha kaise control") ||
    text.includes("kharch kaise control") ||
    text.includes("kharcha manage") ||
    text.includes("kharch manage") ||
    text.includes("kharcha kaise manage") ||
    text.includes("kharch kaise manage") ||
    text.includes("faltu kharcha") ||
    text.includes("faltu kharch") ||
    text.includes("bekar kharcha") ||
    text.includes("bekar kharch") ||
    text.includes("unnecessary expense") ||
    text.includes("unnecessary expenses") ||
    text.includes("unnecessary spending") ||
    text.includes("wasteful spending") ||
    text.includes("kam kaise karu") ||
    text.includes("kam kaise kare") ||
    text.includes("kaise kam karu") ||
    text.includes("kaise kharcha kam karu") ||
    text.includes("kaise kharch kam karu") ||
    text.includes("apna expense kam") ||
    text.includes("apna expenses kam") ||
    text.includes("apna expence kam") ||
    text.includes("apna expence kasa kaam") ||
    text.includes("mera expense kam") ||
    text.includes("mere expenses kam") ||
    text.includes("mera expence kam")
  ) {
    return ai("SPENDING_ADVICE");
  }


  // ==========================================
  // 1.2 Spending Pattern / Behaviour
  // ==========================================

  if (
    text.includes("spending pattern") ||
    text.includes("spending behaviour") ||
    text.includes("spending behavior") ||
    text.includes("expense pattern") ||
    text.includes("expense behaviour") ||
    text.includes("expense behavior") ||
    text.includes("spending habit") ||
    text.includes("spending habits") ||
    text.includes("financial habit") ||
    text.includes("financial habits") ||
    text.includes("spending trend") ||
    text.includes("expense trend") ||
    text.includes("meri spending") ||
    text.includes("mera spending") ||
    text.includes("meri spending pattern") ||
    text.includes("mera spending pattern") ||
    text.includes("mera spending kaisa") ||
    text.includes("meri spending kaisi") ||
    text.includes("mera kharcha kaisa") ||
    text.includes("meri spending habit") ||
    text.includes("mera spending habit") ||
    text.includes("main kaha zyada spend") ||
    text.includes("main kahan zyada spend") ||
    text.includes("main kaha jyada spend") ||
    text.includes("main kahan jyada spend") ||
    text.includes("where do i spend most") ||
    text.includes("how do i spend") ||
    text.includes("where am i spending") ||
    text.includes("why am i spending") ||
    text.includes("why are my expenses increasing") ||
    text.includes("expenses increasing") ||
    text.includes("expense increasing") ||
    text.includes("kharcha badh raha") ||
    text.includes("kharch badh raha") ||
    text.includes("kharcha kyu badh raha") ||
    text.includes("kharch kyu badh raha")
  ) {
    return ai("SPENDING_PATTERN");
  }


  // ==========================================
  // 1.3 Saving Advice
  // ==========================================

  if (
    text.includes("how to save") ||
    text.includes("how can i save") ||
    text.includes("save money") ||
    text.includes("saving tips") ||
    text.includes("saving advice") ||
    text.includes("save more") ||
    text.includes("how to save money") ||
    text.includes("how can i save money") ||
    text.includes("paise bachane") ||
    text.includes("paise bachane kaise") ||
    text.includes("paisa bachane") ||
    text.includes("paisa bachane kaise") ||
    text.includes("paise kaise bach") ||
    text.includes("paisa kaise bach") ||
    text.includes("saving kaise") ||
    text.includes("saving karne") ||
    text.includes("bachat kaise") ||
    text.includes("bachat karne") ||
    text.includes("paise kaise bachaun") ||
    text.includes("paise kaise bachau") ||
    text.includes("paisa kaise bachaun") ||
    text.includes("paisa kaise bachau") ||
    text.includes("saving kaise karu") ||
    text.includes("saving kaise kare")
  ) {
    return ai("SAVING_ADVICE");
  }


  // ==========================================
  // 1.4 Budget Advice
  // ==========================================

  if (
    text.includes("budget kaise") ||
    text.includes("budget banana") ||
    text.includes("budget banau") ||
    text.includes("budget advice") ||
    text.includes("budget manage") ||
    text.includes("budget planning") ||
    text.includes("budget plan") ||
    text.includes("how to budget") ||
    text.includes("how can i budget") ||
    text.includes("how to make a budget") ||
    text.includes("budget kaise banaye") ||
    text.includes("budget kaise bana") ||
    text.includes("budget set kaise") ||
    text.includes("budget kaise set") ||
    text.includes("monthly budget kaise")
  ) {
    return ai("BUDGET_ADVICE");
  }


  // ==========================================
  // 1.5 Financial Analysis / Financial Health
  // ==========================================

  if (
    text.includes("financial analysis") ||
    text.includes("financial health") ||
    text.includes("financial situation") ||
    text.includes("financial condition") ||
    text.includes("financial performance") ||
    text.includes("analyze my finances") ||
    text.includes("analyse my finances") ||
    text.includes("analyze my financial") ||
    text.includes("analyse my financial") ||
    text.includes("analyze my spending") ||
    text.includes("analyse my spending") ||
    text.includes("analyze my expenses") ||
    text.includes("analyse my expenses") ||
    text.includes("meri financial health") ||
    text.includes("meri financial situation") ||
    text.includes("meri financial condition") ||
    text.includes("mera financial health") ||
    text.includes("mera financial situation") ||
    text.includes("mera financial condition") ||
    text.includes("meri financial position") ||
    text.includes("mera financial position")
  ) {
    return ai("FINANCIAL_ANALYSIS");
  }


  // ==========================================
  // 2. DAILY SPENDING LIMIT
  // ==========================================
  //
  // Direct calculation.
  // Gemini NOT required.
  // ==========================================

  if (
    (
      text.includes("daily") ||
      text.includes("per day") ||
      text.includes("every day") ||
      text.includes("har din") ||
      text.includes("har roj") ||
      text.includes("roj") ||
      text.includes("roz")
    ) &&
    (
      text.includes("spend") ||
      text.includes("expense") ||
      text.includes("expenses") ||
      text.includes("expence") ||
      text.includes("kharch") ||
      text.includes("kharcha") ||
      text.includes("rupees") ||
      text.includes("kitna") ||
      text.includes("limit")
    )
  ) {
    return direct("DAILY_LIMIT");
  }


  // ==========================================
  // 3. ABNORMAL EXPENSE
  // ==========================================

  if (
    text.includes("abnormal") ||
    text.includes("unusual") ||
    text.includes("unusual expense") ||
    text.includes("unusual expenses") ||
    text.includes("unusual spending") ||
    text.includes("abnormal expense") ||
    text.includes("abnormal expenses") ||
    text.includes("strange expense") ||
    text.includes("strange expenses") ||
    text.includes("odd expense") ||
    text.includes("odd spending") ||
    text.includes("ajeeb kharcha") ||
    text.includes("ajeeb kharch") ||
    text.includes("alag kharcha") ||
    text.includes("alag kharch") ||
    text.includes("unusual kharcha") ||
    text.includes("unusual kharch")
  ) {
    return direct("ABNORMAL_EXPENSE");
  }


  // ==========================================
  // 4. FORECAST
  // ==========================================

  if (
    text.includes("forecast") ||
    text.includes("future expense") ||
    text.includes("future spending") ||
    text.includes("future") ||
    text.includes("projection") ||
    text.includes("projected") ||
    text.includes("project") ||
    text.includes("bhavishya") ||
    text.includes("aage kitna") ||
    text.includes("aage ka expense") ||
    text.includes("aage ka kharcha") ||
    text.includes("end of month") ||
    text.includes("month end") ||
    text.includes("month-end")
  ) {
    return direct("FORECAST");
  }


  // ==========================================
  // 5. MONTHLY ANALYSIS
  // ==========================================
  //
  // NOTE:
  // "spending pattern" yahan nahi rakha gaya,
  // because it must go to SPENDING_PATTERN.
  // ==========================================

  if (
    text.includes("monthly analysis") ||
    text.includes("month analysis") ||
    text.includes("monthly spending analysis") ||
    text.includes("monthly expense analysis") ||
    text.includes("monthly trend") ||
    text.includes("is month kaisa") ||
    text.includes("is mahine kaisa") ||
    text.includes("this month analysis") ||
    text.includes("month ka analysis") ||
    text.includes("monthly performance") ||
    text.includes("mahine ka analysis")
  ) {
    return direct("MONTHLY_ANALYSIS");
  }


  // ==========================================
  // 6. TOP EXPENSE CATEGORY
  // ==========================================

  if (
    text.includes("sabse zyada") ||
    text.includes("sabse jyada") ||
    text.includes("highest expense") ||
    text.includes("highest spending") ||
    text.includes("biggest expense") ||
    text.includes("biggest spending") ||
    text.includes("most expensive") ||
    text.includes("largest expense") ||
    text.includes("largest spending") ||
    text.includes("highest category") ||
    text.includes("top expense") ||
    text.includes("top spending category") ||
    text.includes("kis category me zyada") ||
    text.includes("kis category mein zyada") ||
    text.includes("kahan sabse zyada spend")
  ) {
    return direct("TOP_CATEGORY");
  }


  // ==========================================
  // 7. RECENT TRANSACTIONS
  // ==========================================

  if (
    text.includes("recent transaction") ||
    text.includes("recent transactions") ||
    text.includes("recent expense") ||
    text.includes("recent expenses") ||
    text.includes("latest transaction") ||
    text.includes("latest transactions") ||
    text.includes("latest expense") ||
    text.includes("latest expenses") ||
    text.includes("last transaction") ||
    text.includes("last transactions") ||
    text.includes("last expense") ||
    text.includes("last expenses") ||
    text.includes("recent kharcha") ||
    text.includes("recent kharch") ||
    text.includes("haal ki transaction") ||
    text.includes("haal ki transactions") ||
    text.includes("latest kharcha") ||
    text.includes("latest kharch")
  ) {
    return direct("RECENT_TRANSACTIONS");
  }


  // ==========================================
  // 8. CATEGORY EXPENSE
  // ==========================================

  if (
    text.includes("grocery") ||
    text.includes("groceries") ||
    text.includes("food") ||
    text.includes("shopping") ||
    text.includes("education") ||
    text.includes("travel") ||
    text.includes("transport") ||
    text.includes("fuel") ||
    text.includes("rent") ||
    text.includes("medical") ||
    text.includes("medicine") ||
    text.includes("entertainment") ||
    text.includes("bill") ||
    text.includes("bills") ||
    text.includes("lic") ||
    text.includes("category")
  ) {
    if (
      text.includes("kitna") ||
      text.includes("kitne") ||
      text.includes("spent") ||
      text.includes("spend") ||
      text.includes("expense") ||
      text.includes("expenses") ||
      text.includes("expence") ||
      text.includes("kharcha") ||
      text.includes("kharch") ||
      text.includes("total") ||
      text.includes("amount")
    ) {
      return direct("CATEGORY_EXPENSE");
    }
  }


  // ==========================================
  // 9. MONTHLY EXPENSE
  // ==========================================

  if (
    text.includes("this month") ||
    text.includes("current month") ||
    text.includes("is month") ||
    text.includes("monthly expense") ||
    text.includes("month expense") ||
    text.includes("monthly kharcha") ||
    text.includes("monthly kharch") ||
    text.includes("mahine ka kharcha") ||
    text.includes("mahine ka kharch") ||
    text.includes("is mahine ka kharcha") ||
    text.includes("is mahine ka kharch") ||
    text.includes("current month expense")
  ) {
    return direct("MONTHLY_EXPENSE");
  }


  // ==========================================
  // 10. TOTAL EXPENSE
  // ==========================================

  if (
    text.includes("total expense") ||
    text.includes("total expenses") ||
    text.includes("total kharcha") ||
    text.includes("total kharch") ||
    text.includes("kitna kharcha") ||
    text.includes("kitna kharch") ||
    text.includes("mera kharcha kitna") ||
    text.includes("mere expenses kitne") ||
    text.includes("mere expense kitne") ||
    text.includes("mere expence kitne") ||
    text.includes("how much did i spend") ||
    text.includes("how much have i spent") ||
    text.includes("how much expense") ||
    text.includes("total spending")
  ) {
    return direct("TOTAL_EXPENSE");
  }


  // ==========================================
  // 11. SAVINGS AMOUNT
  // ==========================================
  //
  // Advice already handled above.
  // ==========================================

  if (
    text.includes("saving") ||
    text.includes("savings") ||
    text.includes("bachat") ||
    text.includes("bacha hua") ||
    text.includes("kitna bacha") ||
    text.includes("kitne paise bache") ||
    text.includes("how much did i save") ||
    text.includes("how much have i saved") ||
    text.includes("meri saving kitni") ||
    text.includes("meri savings kitni") ||
    text.includes("kitni saving hai")
  ) {
    return direct("SAVINGS");
  }


  // ==========================================
  // 12. BALANCE
  // ==========================================

  if (
    text.includes("balance") ||
    text.includes("shesh") ||
    text.includes("remaining balance") ||
    text.includes("current balance") ||
    text.includes("available balance") ||
    text.includes("bacha hua balance") ||
    text.includes("kitna balance") ||
    text.includes("mera balance")
  ) {
    return direct("BALANCE");
  }


  // ==========================================
  // 13. BUDGET DIRECT QUERY
  // ==========================================

  if (
    text === "budget" ||
    text.includes("my budget") ||
    text.includes("mera budget") ||
    text.includes("budget kitna") ||
    text.includes("budget remaining") ||
    text.includes("budget used") ||
    text.includes("budget status") ||
    text.includes("budget limit") ||
    text.includes("budget balance")
  ) {
    return direct("BUDGET");
  }


  // ==========================================
  // 14. GENERAL FINANCIAL QUESTION
  // ==========================================

  if (
    text.includes("finance") ||
    text.includes("financial") ||
    text.includes("money") ||
    text.includes("paisa") ||
    text.includes("paise") ||
    text.includes("investment") ||
    text.includes("invest") ||
    text.includes("debt") ||
    text.includes("loan") ||
    text.includes("financial advice") ||
    text.includes("money advice")
  ) {
    return ai("GENERAL_FINANCIAL");
  }


  // ==========================================
  // 15. EXPENSE / SPENDING FALLBACK
  // ==========================================
  //
  // Expense-related questions which are not
  // simple calculations go to Gemini.
  //
  // ==========================================

  if (
    text.includes("expense") ||
    text.includes("expenses") ||
    text.includes("expence") ||
    text.includes("expences") ||
    text.includes("kharcha") ||
    text.includes("kharch") ||
    text.includes("spending") ||
    text.includes("spent")
  ) {
    return ai("FINANCIAL_ANALYSIS");
  }


  // ==========================================
  // 16. DEFAULT
  // ==========================================
  //
  // Unknown questions go to Gemini.
  // ==========================================

  return ai("GENERAL_FINANCIAL");
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
  detectFinancialIntent,
};