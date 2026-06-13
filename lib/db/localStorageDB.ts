import { v4 as uuidv4 } from 'uuid';
import type { Grocery, MealPlan, Recipe, IDatabase } from '../types';

const KEYS = {
  groceries: 'smartchef_groceries',
  mealPlans: 'smartchef_meal_plans',
  recipes: 'smartchef_recipes',
} as const;

function read<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(data));
}

export class LocalStorageDB implements IDatabase {
  // ---------- Groceries ----------

  async getGroceries(): Promise<Grocery[]> {
    return read<Grocery>(KEYS.groceries);
  }

  async addGrocery(grocery: Omit<Grocery, 'id'>): Promise<Grocery> {
    const groceries = read<Grocery>(KEYS.groceries);
    const created: Grocery = { ...grocery, id: uuidv4() };
    write(KEYS.groceries, [...groceries, created]);
    return created;
  }

  async addGroceries(items: Omit<Grocery, 'id'>[]): Promise<Grocery[]> {
    const groceries = read<Grocery>(KEYS.groceries);
    const created: Grocery[] = items.map((g) => ({ ...g, id: uuidv4() }));
    write(KEYS.groceries, [...groceries, ...created]);
    return created;
  }

  async updateGrocery(id: string, updates: Partial<Grocery>): Promise<Grocery | null> {
    const groceries = read<Grocery>(KEYS.groceries);
    let updated: Grocery | null = null;
    const next = groceries.map((g) => {
      if (g.id === id) {
        updated = { ...g, ...updates };
        return updated;
      }
      return g;
    });
    write(KEYS.groceries, next);
    return updated;
  }

  async deleteGrocery(id: string): Promise<void> {
    const groceries = read<Grocery>(KEYS.groceries);
    write(KEYS.groceries, groceries.filter((g) => g.id !== id));
  }

  async clearNeededGroceries(): Promise<void> {
    const groceries = read<Grocery>(KEYS.groceries);
    write(KEYS.groceries, groceries.filter((g) => g.status !== 'needed'));
  }

  // ---------- Meal Plans ----------

  async getMealPlans(): Promise<MealPlan[]> {
    return read<MealPlan>(KEYS.mealPlans);
  }

  async addMealPlan(plan: Omit<MealPlan, 'id' | 'created_at'>): Promise<MealPlan> {
    const plans = read<MealPlan>(KEYS.mealPlans);
    const created: MealPlan = { ...plan, id: uuidv4(), created_at: new Date().toISOString() };
    write(KEYS.mealPlans, [...plans, created]);
    return created;
  }

  async updateMealPlan(id: string, updates: Partial<MealPlan>): Promise<MealPlan | null> {
    const plans = read<MealPlan>(KEYS.mealPlans);
    let updated: MealPlan | null = null;
    const next = plans.map((p) => {
      if (p.id === id) {
        updated = { ...p, ...updates };
        return updated;
      }
      return p;
    });
    write(KEYS.mealPlans, next);
    return updated;
  }

  async deleteMealPlan(id: string): Promise<void> {
    const plans = read<MealPlan>(KEYS.mealPlans);
    write(KEYS.mealPlans, plans.filter((p) => p.id !== id));
  }

  // ---------- Recipes ----------

  async getRecipes(): Promise<Recipe[]> {
    return read<Recipe>(KEYS.recipes);
  }

  async addRecipe(recipe: Omit<Recipe, 'id' | 'created_at'>): Promise<Recipe> {
    const recipes = read<Recipe>(KEYS.recipes);
    const created: Recipe = { ...recipe, id: uuidv4(), created_at: new Date().toISOString() };
    write(KEYS.recipes, [...recipes, created]);
    return created;
  }

  async deleteRecipe(id: string): Promise<void> {
    const recipes = read<Recipe>(KEYS.recipes);
    write(KEYS.recipes, recipes.filter((r) => r.id !== id));
  }
}
