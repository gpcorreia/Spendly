import type { AIResponse, AIResponseAdvice } from '../types';

const operationFunctions = [
  'create_expense',
  'get_days_spending_month',
  'get_category_spending',
  'get_spending_summary',
  'delete_last_expense',
  'update_last_expense',
  'greeting',
  'unknown',
] as const;

const categories = [
  'Food',
  'Groceries',
  'Transport',
  'Fuel',
  'Rent',
  'Bills',
  'Shopping',
  'Entertainment',
  'Health',
  'Subscriptions',
  'Travel',
  'Other',
] as const;

type JsonObject = Record<string, unknown>;

export class AIResponseValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AIResponseValidationError';
  }
}

const isObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const requireString = (object: JsonObject, field: string): string => {
  const value = object[field];
  if (typeof value !== 'string') {
    throw new AIResponseValidationError(`"${field}" must be a string`);
  }
  return value;
};

const requireNonEmptyString = (object: JsonObject, field: string): string => {
  const value = requireString(object, field).trim();
  if (!value) {
    throw new AIResponseValidationError(`"${field}" cannot be empty`);
  }
  return value;
};

const requirePositiveNumber = (object: JsonObject, field: string): number => {
  const value = object[field];
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new AIResponseValidationError(`"${field}" must be a positive number`);
  }
  return value;
};

const requireDate = (object: JsonObject, field: string): string => {
  const value = requireString(object, field);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) {
    throw new AIResponseValidationError(`"${field}" must use YYYY-MM-DD`);
  }
  return value;
};

const requirePeriod = (object: JsonObject): string => {
  const period = requireString(object, 'period');
  if (!/^(0[1-9]|1[0-2])$/.test(period)) {
    throw new AIResponseValidationError('"period" must be a month between 01 and 12');
  }
  return period;
};

const validateCategory = (value: unknown): string => {
  if (typeof value !== 'string' || !(categories as readonly string[]).includes(value)) {
    throw new AIResponseValidationError(`Invalid category "${String(value)}"`);
  }
  return value;
};

const validateDateRange = (args: JsonObject): void => {
  const startDate = requireDate(args, 'start_date');
  const endDate = requireDate(args, 'end_date');
  if (startDate > endDate) {
    throw new AIResponseValidationError('"start_date" cannot be after "end_date"');
  }
};

const validateOperationArgs = (functionName: string, args: JsonObject): void => {
  switch (functionName) {
    case 'create_expense':
      requirePositiveNumber(args, 'amount');
      validateCategory(args.category);
      requireNonEmptyString(args, 'description');
      requireDate(args, 'date');
      break;
    case 'get_days_spending_month':
      requirePeriod(args);
      validateDateRange(args);
      break;
    case 'get_category_spending':
      requirePeriod(args);
      validateDateRange(args);
      if (args.category !== undefined) {
        validateCategory(args.category);
      }
      break;
    case 'update_last_expense': {
      const editableFields = ['amount', 'category', 'description', 'date'];
      if (!editableFields.some((field) => args[field] !== undefined)) {
        throw new AIResponseValidationError('update_last_expense requires at least one field');
      }
      if (args.amount !== undefined) requirePositiveNumber(args, 'amount');
      if (args.category !== undefined) validateCategory(args.category);
      if (args.description !== undefined) requireNonEmptyString(args, 'description');
      if (args.date !== undefined) requireDate(args, 'date');
      break;
    }
  }
};

export const validateAIResponse = (value: unknown): AIResponse => {
  if (!isObject(value)) {
    throw new AIResponseValidationError('AI response must be a JSON object');
  }

  const type = requireString(value, 'type');
  const functionName = requireString(value, 'function');
  const confidence = value.confidence;
  const args = value.args;
  const userReply = requireString(value, 'user_reply');

  if (type !== 'advice' && type !== 'operation') {
    throw new AIResponseValidationError('"type" must be "advice" or "operation"');
  }
  if (typeof confidence !== 'number' || confidence < 0 || confidence > 1) {
    throw new AIResponseValidationError('"confidence" must be between 0 and 1');
  }
  if (!isObject(args)) {
    throw new AIResponseValidationError('"args" must be a JSON object');
  }

  if (type === 'advice') {
    if (functionName !== 'advice') {
      throw new AIResponseValidationError('Advice responses must use function "advice"');
    }
  } else {
    if (!(operationFunctions as readonly string[]).includes(functionName)) {
      throw new AIResponseValidationError(`Unsupported operation "${functionName}"`);
    }
    validateOperationArgs(functionName, args);
  }

  return {
    type,
    function: functionName,
    confidence,
    args,
    user_reply: userReply,
  };
};

export const validateAdviceResponse = (value: unknown): AIResponseAdvice => {
  if (!isObject(value)) {
    throw new AIResponseValidationError('Advice response must be a JSON object');
  }

  return { msg: requireNonEmptyString(value, 'msg') };
};
