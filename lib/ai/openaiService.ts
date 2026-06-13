import type { AIGeneratedPlan, IAIService } from '../types';

/**
 * Production AI service — calls the /api/chatgpt route handler which uses
 * the server-side OPENAI_API_KEY environment variable.
 */
export class OpenAIService implements IAIService {
  async generateMealPlan(prompt: string): Promise<AIGeneratedPlan> {
    const res = await fetch('/api/chatgpt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(err.error ?? `API error ${res.status}`);
    }

    return res.json() as Promise<AIGeneratedPlan>;
  }
}
