import OpenAI from 'openai';

let openaiInstance: OpenAI | null = null;

export function getOpenAI() {
  if (!openaiInstance) {
    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }
  return openaiInstance;
}

export const MODEL = 'gpt-4o-mini';
export const MAX_TOKENS = 1000;
