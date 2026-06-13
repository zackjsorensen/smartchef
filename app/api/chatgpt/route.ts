import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { AIGeneratedPlan } from '@/lib/types';

const SYSTEM_PROMPT = `You are SmartChef's AI meal planning assistant.

The user will describe meals they want to cook. Your job is to return a structured JSON object with:
1. Detailed recipes for each requested dish.
2. A complete grocery list with categories and estimated shelf life.
3. A suggested weekly schedule.

Respond ONLY with valid JSON matching this exact TypeScript interface — no prose, no markdown fences:

interface AIGeneratedPlan {
  meals: Array<{
    meal_name: string;
    planned_date?: string;  // Day name like "Tuesday" or ISO date
    recipe: {
      title: string;
      description?: string;
      ingredients: Array<{ name: string; amount: string; unit?: string }>;
      instructions: string[];  // Numbered steps as plain strings
      cooking_time: number;    // Minutes
      servings?: number;
      tags?: string[];
    };
    groceries: Array<{
      name: string;
      category: "Produce" | "Meat & Seafood" | "Dairy & Eggs" | "Pantry" | "Frozen" | "Bakery" | "Beverages" | "Other";
      estimated_expiry_days: number;
      quantity?: string;
    }>;
  }>;
  notes?: string;
}

Rules:
- estimated_expiry_days should be realistic (fresh produce: 3-7 days, meat: 1-3 days, pantry: 90-730 days).
- Include ALL ingredients in the groceries array, even common ones like olive oil and salt.
- Keep instructions clear and actionable (10-12 steps per recipe).
- Return 1 meal object per requested dish.`;

export async function POST(req: NextRequest) {
  // If no API key is set, return a clear error so the client can fall back to mock
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY is not configured. Set it in your .env.local to use real AI generation.' },
      { status: 503 }
    );
  }

  let prompt: string;
  try {
    const body = await req.json();
    prompt = String(body.prompt ?? '').trim();
    if (!prompt) throw new Error('Empty prompt');
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(raw) as AIGeneratedPlan;

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('[/api/chatgpt] OpenAI error:', err);
    return NextResponse.json(
      { error: 'Failed to generate meal plan. Please try again.' },
      { status: 500 }
    );
  }
}
