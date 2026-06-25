import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AIResponseValidationError,
  validateAdviceResponse,
  validateAIResponse,
} from '../src/validation/aiResponse';

const validExpense = {
  type: 'operation',
  function: 'create_expense',
  confidence: 0.98,
  args: {
    amount: 12.5,
    category: 'Food',
    description: 'Almoço',
    date: '2026-06-25',
  },
  user_reply: 'Despesa registada.',
};

test('accepts a valid create_expense response', () => {
  const response = validateAIResponse(validExpense);

  assert.equal(response.function, 'create_expense');
  assert.equal(response.args.amount, 12.5);
});

test('rejects create_expense without an amount', () => {
  const invalid = {
    ...validExpense,
    args: { ...validExpense.args, amount: undefined },
  };

  assert.throws(() => validateAIResponse(invalid), AIResponseValidationError);
});

test('rejects categories outside the supported list', () => {
  const invalid = {
    ...validExpense,
    args: { ...validExpense.args, category: 'Electronics' },
  };

  assert.throws(
    () => validateAIResponse(invalid),
    /Invalid category "Electronics"/,
  );
});

test('rejects invalid or reversed date ranges', () => {
  assert.throws(
    () =>
      validateAIResponse({
        type: 'operation',
        function: 'get_days_spending_month',
        confidence: 0.9,
        args: {
          period: '06',
          start_date: '2026-06-30',
          end_date: '2026-06-01',
        },
        user_reply: '',
      }),
    /cannot be after/,
  );
});

test('accepts a valid advice route and advice result', () => {
  const route = validateAIResponse({
    type: 'advice',
    function: 'advice',
    confidence: 0.92,
    args: {},
    user_reply: '',
  });
  const advice = validateAdviceResponse({
    msg: 'Podes rever as tuas subscrições mensais.',
  });

  assert.equal(route.type, 'advice');
  assert.match(advice.msg, /subscrições/);
});

test('rejects unsupported operations', () => {
  assert.throws(
    () =>
      validateAIResponse({
        type: 'operation',
        function: 'transfer_money',
        confidence: 0.99,
        args: {},
        user_reply: '',
      }),
    /Unsupported operation/,
  );
});
