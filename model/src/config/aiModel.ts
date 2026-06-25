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

      try {
        const retryInstruction = attempt === 1 ? '': `A resposta anterior era inválida.
        Analisa novamente a mensagem original e devolve apenas o JSON pedido.
        Respeita exatamente os campos, tipos e valores definidos neste prompt.`;

      
        const response = await this.client.chat.completions.create({
          model,
          messages: [
            { role: "system", content: systemPrompt +retryInstruction },
            { role: "user", content: message }
          ],
        });

        const responseText = response.choices[0]?.message?.content;

        if (!responseText) {
          throw new AIResponseParseError('AI response is empty');
        }

        return validate(parseJSONResponse(responseText));

      }catch (error) {
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
