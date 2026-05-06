import 'server-only';
import Anthropic from '@anthropic-ai/sdk';

let cachedClient: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY ortam değişkeni tanımlı değil');
  }
  cachedClient = new Anthropic({ apiKey });
  return cachedClient;
}

export const AI_MODEL = 'claude-sonnet-4-6' as const;
export const AI_MAX_TOKENS = 1024;
