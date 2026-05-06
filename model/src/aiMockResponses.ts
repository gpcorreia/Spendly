// aiMockResponses.ts

export type AIResponse = {
  function: string;
  confidence: number;
  args: Record<string, any>;
  user_reply: string;
};

// 🔹 CREATE EXPENSE

export const createExpenseGasolina: AIResponse = {
  function: "create_expense",
  confidence: 0.98,
  args: {
    description: "Gasolina",
    amount: 40,
    category: "Fuel",
    date: "2026-04-27",
  },
  user_reply: "Registei 40€ em gasolina.",
};

export const createExpensePrenda: AIResponse = {
  function: "create_expense",
  confidence: 0.98,
  args: {
    description: "Prenda",
    amount: 25,
    category: "Clothing",
    date: "2026-04-27",
  },
  user_reply: "Registei 25€ em roupas.",
};

export const createExpenseTelemovel: AIResponse = {
  function: "create_expense",
  confidence: 0.98,
  args: {
    description: "Telemovel",
    amount: 1400,
    category: "Electronics",
    date: "2026-04-27",
  },
  user_reply: "Registei 1400€ em eletrónica.",
};

export const createExpenseJantar: AIResponse = {
  function: "create_expense",
  confidence: 0.96,
  args: {
    description: "Jantar com amigos",
    amount: 25.5,
    category: "Food",
    date: "2026-04-27",
  },
  user_reply: "Registei 25,50€ em jantar.",
};

export const createExpenseUberOntem: AIResponse = {
  function: "create_expense",
  confidence: 0.93,
  args: {
    description: "Uber",
    amount: 12,
    currency: "EUR",
    category: "Transport",
    date: "2026-04-26",
  },
  user_reply: "Registei 12€ em transporte (ontem).",
};

// 🔹 QUERIES

export const getDaysSpendingMonth: AIResponse = {
  function: "get_days_spending_month",
  confidence: 0.95,
  args: {
    period: "current_month",
    start_date: "2026-04-01",
    end_date: "2026-04-27",
  },
  user_reply: "",
};

export const getCategorySpendingFood: AIResponse = {
  function: "get_category_spending",
  confidence: 0.94,
  args: {
    category: "Food",
    period: "04",
  },
  user_reply: "",
};

export const getSpendingSummary: AIResponse = {
  function: "get_days_spending_month",
  confidence: 0.92,
  args: {
    period: "04",
  },
  user_reply: "",
};

export const getSavingAdvice: AIResponse = {
  function: "get_saving_advice",
  confidence: 0.9,
  args: {
    period: "current_month",
  },
  user_reply: "",
};

// 🔹 EDIT / DELETE

export const deleteLastExpense: AIResponse = {
  function: "delete_last_expense",
  confidence: 0.97,
  args: {},
  user_reply: "Apaguei a última despesa.",
};

export const updateLastExpense: AIResponse = {
  function: "update_last_expense",
  confidence: 0.91,
  args: {
    amount: 30,
    description: "Jantar corrigido",
  },
  user_reply: "Atualizei a última despesa.",
};

// 🔹 OTHER

export const greeting: AIResponse = {
  function: "greeting",
  confidence: 0.99,
  args: {},
  user_reply:
    "Olá! Podes enviar despesas como 'café 2€' ou perguntar quanto já gastaste.",
};

export const unknown: AIResponse = {
  function: "unknown",
  confidence: 0.4,
  args: {},
  user_reply:
    "Não percebi bem. Podes enviar algo como 'jantar 15€' ou 'gasolina 40€'?",
};

// 🔹 EXPORT ALL (opcional para testes dinâmicos)

export const mockAIResponses = {
  createExpenseGasolina,
  createExpenseJantar,
  createExpenseUberOntem,
  getDaysSpendingMonth,
  getCategorySpendingFood,
  getSpendingSummary,
  getSavingAdvice,
  deleteLastExpense,
  updateLastExpense,
  greeting,
  unknown,
};