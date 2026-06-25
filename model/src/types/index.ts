export type User = {
  id: string;
  phone_number: string;
  email: string;
  name: string;
  number_id: string;
  timestamp: string;
  access_token?: string;
};

export type UserPayload = {
  phoneNumber: string;
  email?: string;
  name: string;
  number_id: string;
  timestamp: string;
};

export type AIResponseArgs = Record<string, unknown> & {
  amount?: number;
  category?: string;
  description?: string;
  date?: string;
  period?: string;
  start_date?: string;
  end_date?: string;
};

export type AIResponse = {
  type: "advice" | "operation";
  function: string;
  confidence: number;
  args: AIResponseArgs;
  user_reply: string;
};

export type AIResponseAdvice = {
  msg: string;
};

export type WhatsAppMessage = {
  message_id: string;
  number_id: string;
  number_name: string;
  number: string;
  timestamp: string;
  body: string;
};

export type WhatsAppWebhookValue = {
  metadata: {
    phone_number_id: string;
  };
  contacts?: Array<{
    profile?: {
      name?: string;
    };
  }>;
  messages?: Array<{
    id?: string;
    from: string;
    timestamp: string;
    text?: {
      body?: string;
    };
    type?: string;
  }>;
};
