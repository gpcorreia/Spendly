import { OpenAI } from "openai";
import { AIResponseValidationError } from '../validation/aiResponse';

export class AIResponseParseError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'AIResponseParseError';
  }
}

const parseJSONResponse = (responseText: string): unknown => {
  const normalized = responseText
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');

  try {
    return JSON.parse(normalized);
  } catch (error) {
    throw new AIResponseParseError('AI returned invalid JSON', { cause: error });
  }
};

export class AIModel {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    });
  }

  private getErrorDetails(error: unknown): Record<string, unknown> {
    if (!error || typeof error !== 'object') {
      return { error: String(error) };
    }

    const candidate = error as {
      message?: string;
      status?: number;
      code?: string;
      type?: string;
      name?: string;
      response?: {
        status?: number;
        data?: unknown;
      };
      error?: unknown;
    };

    return {
      name: candidate.name,
      message: candidate.message,
      status: candidate.status ?? candidate.response?.status,
      code: candidate.code,
      type: candidate.type,
      providerError: candidate.error,
      responseData: candidate.response?.data,
    };
  }

  getAIResponse = async <T>(
    message: string,
    systemPrompt: string,
    validate: (value: unknown) => T,
  ): Promise<T> => {
    const model = process.env.OPENROUTER_MODEL;

    if (!model) {
      throw new Error('Missing OPENROUTER_MODEL');
    }

    const maximumAttempts = 2 ;

    for(let attempt = 1; attempt <= maximumAttempts; attempt++) {
      const startedAt = Date.now();

      try {
        const retryInstruction = attempt === 1 ? '': `A resposta anterior era inválida.
        Analisa novamente a mensagem original e devolve apenas o JSON pedido.
        Respeita exatamente os campos, tipos e valores definidos neste prompt.`;

        console.log('AI request started:', {
          model,
          attempt,
          systemPromptChars: systemPrompt.length,
          messageChars: message.length,
        });

        const response = await this.client.chat.completions.create({
          model,
          messages: [
            { role: "system", content: systemPrompt +retryInstruction },
            { role: "user", content: message }
          ],
        });

        const responseText = response.choices?.[0]?.message?.content;

        if (!responseText) {
          console.error('AI response had no message content:', {
            model,
            attempt,
            response,
          });
          throw new AIResponseParseError('AI response is empty or missing choices');
        }

        const parsedResponse = validate(parseJSONResponse(responseText));

        console.log('AI request completed:', {
          model,
          attempt,
          durationMs: Date.now() - startedAt,
          responseChars: responseText.length,
        });

        return parsedResponse;

      }catch (error) {
        console.error('AI request failed:', {
          model,
          attempt,
          durationMs: Date.now() - startedAt,
          ...this.getErrorDetails(error),
        });

        const isInvalidAIResponse =
        error instanceof AIResponseParseError ||
        error instanceof AIResponseValidationError;

        const canRetry =
          isInvalidAIResponse && attempt < maximumAttempts;

        if (canRetry) {
          console.warn('Invalid AI response. Retrying once.', {
            attempt,
            error: error instanceof Error
              ? error.message
              : String(error),
          });

          continue;
        }

        throw error;
      }
    
    }

    throw new Error('AI response could not be processed');

  }

}
