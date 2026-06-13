'use client';

import { useCallback, useEffect, useState } from 'react';
import { getDatabase } from '@/lib/db';
import { getAIService } from '@/lib/ai';
import { MockAIService } from '@/lib/ai/mockAIService';
import type {
  Grocery,
  MealPlan,
  Recipe,
  AIGeneratedPlan,
  AIMealSuggestion,
} from '@/lib/types';

export interface SmartChefState {
  groceries: Grocery[];
  mealPlans: MealPlan[];
  recipes: Recipe[];
  pendingAIPlan: AIGeneratedPlan | null;
  isLoadingAI: boolean;
  aiError: string | null;
  isInitialized: boolean;
}

export interface SmartChefActions {
  // AI
  generateMealPlan: (prompt: string) => Promise<void>;
  clearPendingPlan: () => void;

  // Grocery
  addGroceriesFromAI: (meals: AIMealSuggestion[]) => Promise<void>;
  markGroceryBought: (id: string) => Promise<void>;
  markGroceryNeeded: (id: string) => Promise<void>;
  deleteGrocery: (id: string) => Promise<void>;
  clearPendingGroceries: () => Promise<void>;

  // Meal plan
  addMealPlan: (plan: Omit<MealPlan, 'id' | 'created_at'>) => Promise<MealPlan>;
  markMealCooked: (mealPlanId: string) => Promise<void>;
  deleteMealPlan: (id: string) => Promise<void>;

  // Recipes
  saveRecipe: (recipe: Omit<Recipe, 'id' | 'created_at'>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;

  // Lifecycle
  refreshAll: () => Promise<void>;
}

export type SmartChefHook = SmartChefState & SmartChefActions;

export function useSmartChef(): SmartChefHook {
  const db = getDatabase();

  const [groceries, setGroceries] = useState<Grocery[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [pendingAIPlan, setPendingAIPlan] = useState<AIGeneratedPlan | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const refreshAll = useCallback(async () => {
    const [g, m, r] = await Promise.all([
      db.getGroceries(),
      db.getMealPlans(),
      db.getRecipes(),
    ]);
    setGroceries(g);
    setMealPlans(m);
    setRecipes(r);
  }, [db]);

  useEffect(() => {
    refreshAll().then(() => setIsInitialized(true));
  }, [refreshAll]);

  // ── AI ────────────────────────────────────────────────────────────────────

  const generateMealPlan = useCallback(async (prompt: string) => {
    setIsLoadingAI(true);
    setAiError(null);
    try {
      let service = getAIService();
      try {
        const plan = await service.generateMealPlan(prompt);
        setPendingAIPlan(plan);
      } catch (err) {
        // If OpenAI call fails (no API key, etc.), fall back to mock
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('OPENAI_API_KEY') || msg.includes('503') || msg.includes('API error')) {
          service = new MockAIService();
          const plan = await service.generateMealPlan(prompt);
          setPendingAIPlan(plan);
        } else {
          throw err;
        }
      }
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Failed to generate meal plan.');
    } finally {
      setIsLoadingAI(false);
    }
  }, []);

  const clearPendingPlan = useCallback(() => setPendingAIPlan(null), []);

  // ── Groceries ─────────────────────────────────────────────────────────────

  const addGroceriesFromAI = useCallback(
    async (meals: AIMealSuggestion[]) => {
      // De-duplicate by name (case-insensitive)
      const existing = await db.getGroceries();
      const existingNames = new Set(existing.map((g) => g.name.toLowerCase()));

      const toAdd = meals
        .flatMap((m) => m.groceries)
        .filter((g) => !existingNames.has(g.name.toLowerCase()))
        .map((g) => ({
          name: g.name,
          category: g.category,
          status: 'needed' as const,
          quantity: g.quantity,
          estimated_expiry_days: g.estimated_expiry_days,
        }));

      if (toAdd.length > 0) {
        await db.addGroceries(toAdd);
      }
      await refreshAll();
    },
    [db, refreshAll]
  );

  const markGroceryBought = useCallback(
    async (id: string) => {
      const now = new Date();
      const grocery = groceries.find((g) => g.id === id);
      if (!grocery) return;
      const expiresAt = new Date(
        now.getTime() + grocery.estimated_expiry_days * 24 * 60 * 60 * 1000
      ).toISOString();
      await db.updateGrocery(id, {
        status: 'bought',
        date_bought: now.toISOString(),
        expires_at: expiresAt,
      });
      await refreshAll();
    },
    [db, groceries, refreshAll]
  );

  const markGroceryNeeded = useCallback(
    async (id: string) => {
      await db.updateGrocery(id, {
        status: 'needed',
        date_bought: undefined,
        expires_at: undefined,
      });
      await refreshAll();
    },
    [db, refreshAll]
  );

  const deleteGrocery = useCallback(
    async (id: string) => {
      await db.deleteGrocery(id);
      await refreshAll();
    },
    [db, refreshAll]
  );

  const clearPendingGroceries = useCallback(async () => {
    await db.clearNeededGroceries();
    await refreshAll();
  }, [db, refreshAll]);

  // ── Meal Plans ────────────────────────────────────────────────────────────

  const addMealPlan = useCallback(
    async (plan: Omit<MealPlan, 'id' | 'created_at'>) => {
      const created = await db.addMealPlan(plan);
      await refreshAll();
      return created;
    },
    [db, refreshAll]
  );

  const markMealCooked = useCallback(
    async (mealPlanId: string) => {
      const meal = mealPlans.find((m) => m.id === mealPlanId);
      if (!meal) return;

      // Archive the meal
      await db.updateMealPlan(mealPlanId, { status: 'cooked' });

      // Consume (delete) the associated groceries from the kitchen
      await Promise.all(meal.ingredients_used.map((gId) => db.deleteGrocery(gId)));

      await refreshAll();
    },
    [db, mealPlans, refreshAll]
  );

  const deleteMealPlan = useCallback(
    async (id: string) => {
      await db.deleteMealPlan(id);
      await refreshAll();
    },
    [db, refreshAll]
  );

  // ── Recipes ───────────────────────────────────────────────────────────────

  const saveRecipe = useCallback(
    async (recipe: Omit<Recipe, 'id' | 'created_at'>) => {
      await db.addRecipe(recipe);
      await refreshAll();
    },
    [db, refreshAll]
  );

  const deleteRecipe = useCallback(
    async (id: string) => {
      await db.deleteRecipe(id);
      await refreshAll();
    },
    [db, refreshAll]
  );

  return {
    groceries,
    mealPlans,
    recipes,
    pendingAIPlan,
    isLoadingAI,
    aiError,
    isInitialized,
    generateMealPlan,
    clearPendingPlan,
    addGroceriesFromAI,
    markGroceryBought,
    markGroceryNeeded,
    deleteGrocery,
    clearPendingGroceries,
    addMealPlan,
    markMealCooked,
    deleteMealPlan,
    saveRecipe,
    deleteRecipe,
    refreshAll,
  };
}
