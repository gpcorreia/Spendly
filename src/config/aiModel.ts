import { OpenAI } from "openai";

export class AIModel {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    });
  }

   getAIResponse = async (message: string,systemPrompt:string): Promise<any> => {
    const model = process.env.OPENROUTER_MODEL;

    const response = await this.client.chat.completions.create({
      model: model+"",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
    });

    const responseText = response.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error('AI response is empty');
    }

    return JSON.parse(responseText);
  }

}
