'use client';

import { useMemo } from 'react';
import { AlertTriangle, Flame, CheckCircle2, Calendar, Clock, ChefHat } from 'lucide-react';
import type { MealPlan, Recipe, Grocery } from '@/lib/types';
import { getDaysRemaining, getFreshnessLevel } from '@/lib/types';
import { FreshnessIndicator } from '@/components/ui/FreshnessIndicator';

interface MealTodoProps {
  mealPlans: MealPlan[];
  recipes: Recipe[];
  groceries: Grocery[];
  onMarkCooked: (mealPlanId: string) => Promise<void>;
  onNavigateToRecipe: () => void;
}

interface MealUrgency {
  meal: MealPlan;
  recipe: Recipe | null;
  urgentIngredients: Grocery[];
  minDaysRemaining: number;
  urgencyLevel: 'critical' | 'warning' | 'normal';
}

export function MealTodo({ mealPlans, recipes, groceries, onMarkCooked, onNavigateToRecipe }: MealTodoProps) {
  const pendingMeals = mealPlans.filter((m) => m.status === 'pending');

  const mealUrgencies = useMemo((): MealUrgency[] => {
    return pendingMeals
      .map((meal): MealUrgency => {
        const recipe = meal.recipe_id ? recipes.find((r) => r.id === meal.recipe_id) ?? null : null;

        // Match ingredients_used grocery IDs to actual bought groceries
        const boughtGroceries = groceries.filter((g) => g.status === 'bought');

        // If we have linked grocery IDs, use them; otherwise try name matching
        let relevantGroceries: Grocery[];
        if (meal.ingredients_used.length > 0) {
          relevantGroceries = boughtGroceries.filter((g) => meal.ingredients_used.includes(g.id));
        } else if (recipe) {
          // Fuzzy match by name
          relevantGroceries = boughtGroceries.filter((g) =>
            recipe.ingredients.some((ing) =>
              ing.name.toLowerCase().includes(g.name.toLowerCase()) ||
              g.name.toLowerCase().includes(ing.name.toLowerCase())
            )
          );
        } else {
          relevantGroceries = [];
        }

        const urgentIngredients = relevantGroceries.filter((g) => {
          if (!g.expires_at) return false;
          const days = getDaysRemaining(g.expires_at);
          return days <= 4;
        });

        // Sort by soonest expiry
        urgentIngredients.sort((a, b) => {
          const dA = getDaysRemaining(a.expires_at);
          const dB = getDaysRemaining(b.expires_at);
          return dA - dB;
        });

        const minDaysRemaining = urgentIngredients.length > 0
          ? getDaysRemaining(urgentIngredients[0].expires_at)
          : 999;

        let urgencyLevel: MealUrgency['urgencyLevel'] = 'normal';
        if (minDaysRemaining <= 1) urgencyLevel = 'critical';
        else if (minDaysRemaining <= 4) urgencyLevel = 'warning';

        return { meal, recipe, urgentIngredients, minDaysRemaining, urgencyLevel };
      })
      .sort((a, b) => a.minDaysRemaining - b.minDaysRemaining);
  }, [pendingMeals, recipes, groceries]);

  const criticalCount = mealUrgencies.filter((m) => m.urgencyLevel === 'critical').length;
  const warningCount = mealUrgencies.filter((m) => m.urgencyLevel === 'warning').length;

  if (pendingMeals.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-gray-900">Smart Cook Planner</h2>
        <p className="text-gray-500 text-sm">
          Prioritized by ingredient expiration — cook these meals before food goes to waste.
        </p>
      </div>

      {/* Summary pills */}
      {(criticalCount > 0 || warningCount > 0) && (
        <div className="flex flex-wrap gap-2">
          {criticalCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-full">
              <Flame className="w-3.5 h-3.5 text-red-600" />
              <span className="text-xs font-semibold text-red-700">
                {criticalCount} meal{criticalCount > 1 ? 's' : ''} — cook today!
              </span>
            </div>
          )}
          {warningCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-semibold text-amber-700">
                {warningCount} meal{warningCount > 1 ? 's' : ''} — cook within 4 days
              </span>
            </div>
          )}
        </div>
      )}

      {/* Meal cards */}
      <div className="space-y-4">
        {mealUrgencies.map(({ meal, recipe, urgentIngredients, minDaysRemaining, urgencyLevel }) => (
          <MealUrgencyCard
            key={meal.id}
            meal={meal}
            recipe={recipe}
            urgentIngredients={urgentIngredients}
            minDaysRemaining={minDaysRemaining}
            urgencyLevel={urgencyLevel}
            onMarkCooked={() => onMarkCooked(meal.id)}
            onViewRecipe={onNavigateToRecipe}
          />
        ))}
      </div>

      {/* Cooked meals archived note */}
      {mealPlans.some((m) => m.status === 'cooked') && (
        <div className="flex items-center gap-2 text-sm text-gray-400 border-t pt-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {mealPlans.filter((m) => m.status === 'cooked').length} meal
          {mealPlans.filter((m) => m.status === 'cooked').length > 1 ? 's' : ''} cooked this week. Well done!
        </div>
      )}
    </div>
  );
}

// ── Meal Urgency Card ────────────────────────────────────────────────────────

interface MealUrgencyCardProps {
  meal: MealPlan;
  recipe: Recipe | null;
  urgentIngredients: Grocery[];
  minDaysRemaining: number;
  urgencyLevel: 'critical' | 'warning' | 'normal';
  onMarkCooked: () => void;
  onViewRecipe: () => void;
}

function MealUrgencyCard({
  meal, recipe, urgentIngredients, minDaysRemaining, urgencyLevel,
  onMarkCooked, onViewRecipe
}: MealUrgencyCardProps) {
  const urgencyConfig = {
    critical: {
      border: 'border-red-300',
      bg: 'bg-red-50',
      headerBg: 'bg-gradient-to-r from-red-500 to-red-600',
      icon: <Flame className="w-4 h-4 text-white" />,
      badge: 'bg-red-500',
      text: 'Cook today!',
    },
    warning: {
      border: 'border-amber-300',
      bg: 'bg-amber-50/50',
      headerBg: 'bg-gradient-to-r from-amber-500 to-amber-400',
      icon: <AlertTriangle className="w-4 h-4 text-white" />,
      badge: 'bg-amber-500',
      text: 'Cook soon',
    },
    normal: {
      border: 'border-gray-200',
      bg: 'bg-white',
      headerBg: 'bg-gradient-to-r from-emerald-600 to-emerald-500',
      icon: <ChefHat className="w-4 h-4 text-white" />,
      badge: 'bg-emerald-500',
      text: 'On schedule',
    },
  };

  const cfg = urgencyConfig[urgencyLevel];

  return (
    <div className={`rounded-2xl border-2 overflow-hidden shadow-sm ${cfg.border} ${cfg.bg}`}>
      {/* Card header */}
      <div className={`flex items-center gap-3 px-4 py-3 ${cfg.headerBg}`}>
        <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
          {cfg.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white truncate">{meal.meal_name}</h4>
          {meal.planned_date && (
            <p className="text-xs text-white/70 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {meal.planned_date}
            </p>
          )}
        </div>
        <div className={`px-2.5 py-1 rounded-full text-xs font-bold text-white ${cfg.badge}`}>
          {cfg.text}
        </div>
      </div>

      {/* Card body */}
      <div className="px-4 py-4 space-y-4">
        {/* Recipe info */}
        {recipe && (
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{recipe.cooking_time} min cook time</span>
            {recipe.servings && <span>· {recipe.servings} servings</span>}
          </div>
        )}

        {/* Urgent ingredients */}
        {urgentIngredients.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              ⚠️ Expiring ingredients
            </p>
            <div className="space-y-2">
              {urgentIngredients.map((g) => (
                <div key={g.id} className="bg-white rounded-xl border border-gray-100 px-3 py-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800">{g.name}</span>
                    <span className="text-xs text-gray-400">{g.quantity}</span>
                  </div>
                  <FreshnessIndicator expiresAt={g.expires_at} />
                </div>
              ))}
            </div>
          </div>
        )}

        {urgentIngredients.length === 0 && minDaysRemaining === 999 && (
          <p className="text-sm text-gray-500 italic">
            No matching ingredients found in your kitchen yet. Add groceries to track freshness.
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={onMarkCooked}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4
                       bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold
                       rounded-xl transition-colors shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark Cooked
          </button>
          {recipe && (
            <button
              onClick={onViewRecipe}
              className="flex items-center justify-center gap-1.5 py-2.5 px-4
                         bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium
                         border border-gray-200 rounded-xl transition-colors"
            >
              <ChefHat className="w-4 h-4" />
              Recipe
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Smart Cook Planner</h2>
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-300" />
        </div>
        <div>
          <p className="font-semibold text-gray-700">All clear!</p>
          <p className="text-sm text-gray-400 mt-1">
            Plan some meals to see cooking priorities here.
          </p>
        </div>
      </div>
    </div>
  );
}
