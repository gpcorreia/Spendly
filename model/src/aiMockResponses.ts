// aiMockResponses.ts

import type { AIResponse } from "./types";

export type { AIResponse };

// 🔹 CREATE EXPENSE

export const createExpenseGasolina: AIResponse = {
  type: "operation",
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
  type: "operation",
  function: "create_expense",
  confidence: 0.98,
  args: {
    description: "Prenda",
    amount: 25,
    category: "Shopping",
    date: "2026-04-27",
  },
  user_reply: "Registei 25€ em roupas.",
};

export const createExpenseTelemovel: AIResponse = {
  type: "operation",
  function: "create_expense",
  confidence: 0.98,
  args: {
    description: "Telemovel",
    amount: 1400,
    category: "Shopping",
    date: "2026-04-27",
  },
  user_reply: "Registei 1400€ em eletrónica.",
};

export const createExpenseJantar: AIResponse = {
  type: "operation",
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
  type: "operation",
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
  type: "operation",
  function: "get_days_spending_month",
  confidence: 0.95,
  args: {
    period: "04",
    start_date: "2026-04-01",
    end_date: "2026-04-27",
  },
  user_reply: "",
};

export const getCategorySpendingFood: AIResponse = {
  type: "operation",
  function: "get_category_spending",
  confidence: 0.94,
  args: {
    category: "Food",
    period: "04",
    start_date: "2026-04-01",
    end_date: "2026-04-30",
  },
  user_reply: "",
};

export const getSpendingSummary: AIResponse = {
  type: "operation",
  function: "get_days_spending_month",
  confidence: 0.92,
  args: {
    period: "04",
    start_date: "2026-04-01",
    end_date: "2026-04-30",
  },
  user_reply: "",
};

export const getSavingAdvice: AIResponse = {
  type: "advice",
  function: "advice",
  confidence: 0.9,
  args: {
    period: "current_month",
  },
  user_reply: "",
};

// 🔹 EDIT / DELETE

export const deleteLastExpense: AIResponse = {
  type: "operation",
  function: "delete_last_expense",
  confidence: 0.97,
  args: {},
  user_reply: "Apaguei a última despesa.",
};

export const updateLastExpense: AIResponse = {
  type: "operation",
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
  type: "operation",
  function: "greeting",
  confidence: 0.99,
  args: {},
  user_reply:
    "Olá! Podes enviar despesas como 'café 2€' ou perguntar quanto já gastaste.",
};

export const unknown: AIResponse = {
  type: "operation",
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
