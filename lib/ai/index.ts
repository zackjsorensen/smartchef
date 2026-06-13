/**
 * AI service factory.
 * Falls back to MockAIService when NEXT_PUBLIC_USE_MOCK_AI is truthy or
 * when there's no API key configured (detected at runtime via the /api/chatgpt
 * route returning a config-error status).
 *
 * To swap to a different provider, implement IAIService and update the
 * import below.
 */
import type { IAIService } from '../types';
import { OpenAIService } from './openaiService';
import { MockAIService } from './mockAIService';

export function getAIService(): IAIService {
  // Allow the developer to force mock mode via an env variable
  if (process.env.NEXT_PUBLIC_USE_MOCK_AI === 'true') {
    return new MockAIService();
  }
  return new OpenAIService();
}
