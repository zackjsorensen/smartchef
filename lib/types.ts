// ============================================================
// Core Domain Types
// ============================================================

export type GroceryCategory =
  | 'Produce'
  | 'Meat & Seafood'
  | 'Dairy & Eggs'
  | 'Pantry'
  | 'Frozen'
  | 'Bakery'
  | 'Beverages'
  | 'Other';

export const GROCERY_CATEGORIES: GroceryCategory[] = [
  'Produce',
  'Meat & Seafood',
  'Dairy & Eggs',
  'Pantry',
  'Frozen',
  'Bakery',
  'Beverages',
  'Other',
];

export type GroceryStatus = 'needed' | 'bought';
export type MealStatus = 'pending' | 'cooked';

export interface Grocery {
  id: string;
  name: string;
  category: GroceryCategory;
  status: GroceryStatus;
  quantity?: string;
  date_bought?: string;       // ISO date string — set when status → 'bought'
  estimated_expiry_days: number;
  expires_at?: string;        // ISO date string — derived from date_bought + estimated_expiry_days
}

export interface RecipeIngredient {
  name: string;
  amount: string;
  unit?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  cooking_time: number; // minutes
  servings?: number;
  tags?: string[];
  created_at: string;
}

export interface MealPlan {
  id: string;
  meal_name: string;
  planned_date: string;         // ISO date string
  status: MealStatus;
  recipe_id?: string;
  ingredients_used: string[];   // Grocery IDs
  created_at: string;
}

// ============================================================
// AI Request / Response Contracts
// ============================================================

export interface AIGroceryItem {
  name: string;
  category: GroceryCategory;
  estimated_expiry_days: number;
  quantity?: string;
}

export interface AIMealSuggestion {
  meal_name: string;
  planned_date?: string; // e.g. "Tuesday", "2026-06-17"
  recipe: Omit<Recipe, 'id' | 'created_at'>;
  groceries: AIGroceryItem[];
}

export interface AIGeneratedPlan {
  meals: AIMealSuggestion[];
  notes?: string;
}

// ============================================================
// Database Interface — swap the implementation without touching
// any consumer code
// ============================================================

export interface IDatabase {
  // ---------- Groceries ----------
  getGroceries(): Promise<Grocery[]>;
  addGrocery(grocery: Omit<Grocery, 'id'>): Promise<Grocery>;
  addGroceries(groceries: Omit<Grocery, 'id'>[]): Promise<Grocery[]>;
  updateGrocery(id: string, updates: Partial<Grocery>): Promise<Grocery | null>;
  deleteGrocery(id: string): Promise<void>;
  clearNeededGroceries(): Promise<void>;

  // ---------- Meal Plans ----------
  getMealPlans(): Promise<MealPlan[]>;
  addMealPlan(plan: Omit<MealPlan, 'id' | 'created_at'>): Promise<MealPlan>;
  updateMealPlan(id: string, updates: Partial<MealPlan>): Promise<MealPlan | null>;
  deleteMealPlan(id: string): Promise<void>;

  // ---------- Recipes ----------
  getRecipes(): Promise<Recipe[]>;
  addRecipe(recipe: Omit<Recipe, 'id' | 'created_at'>): Promise<Recipe>;
  deleteRecipe(id: string): Promise<void>;
}

// ============================================================
// AI Service Interface — swap OpenAI for another provider freely
// ============================================================

export interface IAIService {
  generateMealPlan(prompt: string): Promise<AIGeneratedPlan>;
}

// ============================================================
// UI Helper Types
// ============================================================

export type FreshnessLevel = 'fresh' | 'warning' | 'urgent' | 'expired';

export function getFreshnessLevel(daysRemaining: number): FreshnessLevel {
  if (daysRemaining <= 0) return 'expired';
  if (daysRemaining === 1) return 'urgent';
  if (daysRemaining <= 4) return 'warning';
  return 'fresh';
}

export function getDaysRemaining(expiresAt: string | undefined): number {
  if (!expiresAt) return 999;
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
