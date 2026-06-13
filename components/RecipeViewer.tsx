'use client';

import { useState } from 'react';
import {
  ChefHat, Clock, Users, CheckCircle2, Circle,
  CheckSquare, Calendar, Flame, BookOpen, Trash2, X
} from 'lucide-react';
import type { MealPlan, Recipe, Grocery } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';

interface RecipeViewerProps {
  mealPlans: MealPlan[];
  recipes: Recipe[];
  groceries: Grocery[];
  onMarkCooked: (mealPlanId: string) => Promise<void>;
  onDeleteMealPlan: (id: string) => Promise<void>;
  onDeleteRecipe: (id: string) => Promise<void>;
}

export function RecipeViewer({
  mealPlans,
  recipes,
  groceries,
  onMarkCooked,
  onDeleteMealPlan,
  onDeleteRecipe,
}: RecipeViewerProps) {
  const [activeMealId, setActiveMealId] = useState<string | null>(null);
  const [checkedSteps, setCheckedSteps] = useState<Set<string>>(new Set());
  const [markingCooked, setMarkingCooked] = useState<string | null>(null);

  const pendingMeals = mealPlans.filter((m) => m.status === 'pending');
  const savedRecipes = recipes;

  const activeMeal = activeMealId
    ? pendingMeals.find((m) => m.id === activeMealId) ?? null
    : null;

  const activeRecipe = activeMeal?.recipe_id
    ? recipes.find((r) => r.id === activeMeal.recipe_id)
    : null;

  const toggleStep = (key: string) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleMarkCooked = async (mealId: string) => {
    setMarkingCooked(mealId);
    await onMarkCooked(mealId);
    setActiveMealId(null);
    setCheckedSteps(new Set());
    setMarkingCooked(null);
  };

  // Ingredient availability
  const ingredientStatus = (ingredientName: string): 'available' | 'missing' => {
    const found = groceries.find(
      (g) => g.status === 'bought' && g.name.toLowerCase().includes(ingredientName.toLowerCase())
    );
    return found ? 'available' : 'missing';
  };

  if (activeMeal && activeRecipe) {
    return (
      <ActiveRecipeView
        meal={activeMeal}
        recipe={activeRecipe}
        checkedSteps={checkedSteps}
        onToggleStep={toggleStep}
        onMarkCooked={() => handleMarkCooked(activeMeal.id)}
        onBack={() => setActiveMealId(null)}
        markingCooked={markingCooked === activeMeal.id}
        ingredientStatus={ingredientStatus}
      />
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Recipes</h2>

      {/* Active meal plan */}
      {pendingMeals.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-gray-800">This Week&apos;s Meals</h3>
            <Badge variant="emerald">{pendingMeals.length}</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pendingMeals.map((meal) => {
              const recipe = meal.recipe_id ? recipes.find((r) => r.id === meal.recipe_id) : null;
              return (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  recipe={recipe ?? null}
                  onOpen={() => recipe && setActiveMealId(meal.id)}
                  onDelete={() => onDeleteMealPlan(meal.id)}
                  hasRecipe={!!recipe}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Saved recipes library */}
      {savedRecipes.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Saved Recipes</h3>
            <Badge variant="amber">{savedRecipes.length}</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {savedRecipes.map((recipe) => (
              <SavedRecipeCard
                key={recipe.id}
                recipe={recipe}
                onDelete={() => onDeleteRecipe(recipe.id)}
              />
            ))}
          </div>
        </section>
      )}

      {pendingMeals.length === 0 && savedRecipes.length === 0 && (
        <EmptyState />
      )}
    </div>
  );
}

// ── Active Recipe Viewer ─────────────────────────────────────────────────────

interface ActiveRecipeViewProps {
  meal: MealPlan;
  recipe: Recipe;
  checkedSteps: Set<string>;
  onToggleStep: (key: string) => void;
  onMarkCooked: () => Promise<void>;
  onBack: () => void;
  markingCooked: boolean;
  ingredientStatus: (name: string) => 'available' | 'missing';
}

function ActiveRecipeView({
  meal, recipe, checkedSteps, onToggleStep, onMarkCooked, onBack, markingCooked, ingredientStatus
}: ActiveRecipeViewProps) {
  const completedSteps = recipe.instructions.filter((_, i) =>
    checkedSteps.has(`${meal.id}-step-${i}`)
  ).length;
  const progress = Math.round((completedSteps / recipe.instructions.length) * 100);

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <X className="w-4 h-4" />
        Back to recipes
      </button>

      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-emerald-200 text-sm font-medium">{meal.planned_date}</p>
            <h1 className="text-2xl font-bold">{recipe.title}</h1>
            {recipe.description && (
              <p className="text-emerald-100 text-sm mt-1">{recipe.description}</p>
            )}
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center gap-1.5 text-sm text-emerald-100">
            <Clock className="w-4 h-4" />
            {recipe.cooking_time} min
          </div>
          {recipe.servings && (
            <div className="flex items-center gap-1.5 text-sm text-emerald-100">
              <Users className="w-4 h-4" />
              {recipe.servings} servings
            </div>
          )}
        </div>
      </div>

      {/* Progress */}
      {completedSteps > 0 && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 font-medium">Cooking progress</span>
            <span className="text-emerald-600 font-semibold">{completedSteps}/{recipe.instructions.length} steps</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Ingredients */}
      <section className="space-y-3">
        <h3 className="font-semibold text-gray-900">Ingredients</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {recipe.ingredients.map((ing, i) => {
            const status = ingredientStatus(ing.name);
            return (
              <div
                key={i}
                className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-sm
                  ${status === 'available'
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                    : 'bg-gray-50 border-gray-100 text-gray-600'
                  }`}
              >
                <div className="flex items-center gap-2">
                  {status === 'available'
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    : <Circle className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                  }
                  <span className="font-medium">{ing.name}</span>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {ing.amount} {ing.unit}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Instructions */}
      <section className="space-y-3">
        <h3 className="font-semibold text-gray-900">Instructions</h3>
        <ol className="space-y-2">
          {recipe.instructions.map((step, i) => {
            const key = `${meal.id}-step-${i}`;
            const isDone = checkedSteps.has(key);
            return (
              <li key={i}>
                <button
                  onClick={() => onToggleStep(key)}
                  className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left
                    transition-all duration-150
                    ${isDone
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {isDone
                      ? <CheckSquare className="w-5 h-5 text-emerald-500" />
                      : <div className="w-5 h-5 rounded border-2 border-gray-300 flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-400">{i + 1}</span>
                        </div>
                    }
                  </div>
                  <p className={`text-sm leading-relaxed ${isDone ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {step}
                  </p>
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Mark as cooked */}
      <button
        onClick={onMarkCooked}
        disabled={markingCooked}
        className="
          w-full flex items-center justify-center gap-2 px-6 py-4
          bg-gradient-to-r from-amber-500 to-amber-400
          hover:from-amber-600 hover:to-amber-500
          disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed
          text-white font-semibold rounded-2xl shadow-md hover:shadow-lg
          transition-all duration-200 text-sm
        "
      >
        <Flame className="w-4 h-4" />
        {markingCooked ? 'Marking as cooked…' : 'Mark Meal as Cooked'}
      </button>
    </div>
  );
}

// ── Meal Card ────────────────────────────────────────────────────────────────

interface MealCardProps {
  meal: MealPlan;
  recipe: Recipe | null;
  onOpen: () => void;
  onDelete: () => void;
  hasRecipe: boolean;
}

function MealCard({ meal, recipe, onOpen, onDelete, hasRecipe }: MealCardProps) {
  return (
    <div className="group bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-xs text-emerald-600 font-medium">{meal.planned_date}</p>
          <h4 className="font-semibold text-gray-900 truncate">{meal.meal_name}</h4>
          {recipe && (
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {recipe.cooking_time}m
              </span>
              {recipe.servings && (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {recipe.servings}
                </span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {hasRecipe ? (
        <button
          onClick={onOpen}
          className="mt-3 w-full py-2 text-xs font-semibold text-emerald-700
                     bg-emerald-50 hover:bg-emerald-100 rounded-xl
                     transition-colors flex items-center justify-center gap-1.5"
        >
          <ChefHat className="w-3.5 h-3.5" />
          Start Cooking
        </button>
      ) : (
        <p className="mt-3 text-xs text-gray-400 italic text-center py-2">No recipe linked</p>
      )}
    </div>
  );
}

// ── Saved Recipe Card ────────────────────────────────────────────────────────

interface SavedRecipeCardProps {
  recipe: Recipe;
  onDelete: () => void;
}

function SavedRecipeCard({ recipe, onDelete }: SavedRecipeCardProps) {
  return (
    <div className="group bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0 space-y-1">
          <h4 className="font-semibold text-gray-900 truncate">{recipe.title}</h4>
          {recipe.description && (
            <p className="text-xs text-gray-500 line-clamp-2">{recipe.description}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {recipe.cooking_time}m
            </span>
            <span>{recipe.ingredients.length} ingredients</span>
          </div>
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {recipe.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-all flex-shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
      <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center">
        <BookOpen className="w-8 h-8 text-amber-300" />
      </div>
      <div>
        <p className="font-semibold text-gray-700">No recipes yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Generate a meal plan to get recipes, or save recipes from the AI suggestions.
        </p>
      </div>
    </div>
  );
}
