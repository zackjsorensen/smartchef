'use client';

import { useState } from 'react';
import {
  ShoppingCart, CheckCircle2, ChevronDown, ChevronUp,
  Clock, Users, Bookmark, Plus, X
} from 'lucide-react';
import type { AIGeneratedPlan, AIMealSuggestion, GroceryCategory } from '@/lib/types';
import { GROCERY_CATEGORIES } from '@/lib/types';
import { CategoryBadge } from '@/components/ui/Badge';

interface PendingShoppingListProps {
  plan: AIGeneratedPlan;
  onAddToShoppingList: (meals: AIMealSuggestion[]) => Promise<void>;
  onSaveRecipe: (meal: AIMealSuggestion) => Promise<void>;
  onAddToMealPlan: (meal: AIMealSuggestion) => Promise<void>;
  onDismiss: () => void;
}

export function PendingShoppingList({
  plan,
  onAddToShoppingList,
  onSaveRecipe,
  onAddToMealPlan,
  onDismiss,
}: PendingShoppingListProps) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(plan.meals.map((m) => m.meal_name))
  );
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(
    new Set(plan.meals.map((m) => m.meal_name))
  );
  const [saving, setSaving] = useState<Set<string>>(new Set());
  const [isAdding, setIsAdding] = useState(false);

  const toggleSelected = (mealName: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(mealName)) next.delete(mealName);
      else next.add(mealName);
      return next;
    });
  };

  const toggleExpanded = (mealName: string) => {
    setExpandedMeals((prev) => {
      const next = new Set(prev);
      if (next.has(mealName)) next.delete(mealName);
      else next.add(mealName);
      return next;
    });
  };

  const selectedMeals = plan.meals.filter((m) => selected.has(m.meal_name));

  // Group all selected groceries by category
  const groceriesByCategory: Partial<Record<GroceryCategory, AIMealSuggestion['groceries']>> = {};
  for (const meal of selectedMeals) {
    for (const g of meal.groceries) {
      if (!groceriesByCategory[g.category]) groceriesByCategory[g.category] = [];
      groceriesByCategory[g.category]!.push(g);
    }
  }

  const handleAddToShoppingList = async () => {
    if (selectedMeals.length === 0) return;
    setIsAdding(true);
    await onAddToShoppingList(selectedMeals);
    // Also add each selected meal to the meal plan
    for (const meal of selectedMeals) {
      await onAddToMealPlan(meal);
    }
    setIsAdding(false);
  };

  const handleSaveRecipe = async (meal: AIMealSuggestion) => {
    setSaving((prev) => new Set([...prev, meal.meal_name]));
    await onSaveRecipe(meal);
    setSaving((prev) => {
      const next = new Set(prev);
      next.delete(meal.meal_name);
      return next;
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">AI-Generated Meal Plan</h3>
          <p className="text-sm text-gray-500 mt-1">
            {plan.meals.length} recipe{plan.meals.length !== 1 ? 's' : ''} generated.
            Select the ones you want to cook.
          </p>
          {plan.notes && (
            <p className="text-xs text-emerald-600 mt-2 italic">{plan.notes}</p>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Recipe cards */}
      <div className="space-y-4">
        {plan.meals.map((meal) => {
          const isSelected = selected.has(meal.meal_name);
          const isExpanded = expandedMeals.has(meal.meal_name);
          const isSaving = saving.has(meal.meal_name);

          return (
            <div
              key={meal.meal_name}
              className={`rounded-2xl border-2 transition-all duration-200 overflow-hidden
                ${isSelected
                  ? 'border-emerald-400 bg-emerald-50/40 shadow-sm'
                  : 'border-gray-200 bg-white'
                }`}
            >
              {/* Card header */}
              <div className="flex items-start gap-3 p-4">
                <button
                  onClick={() => toggleSelected(meal.meal_name)}
                  className="mt-0.5 flex-shrink-0"
                >
                  <CheckCircle2
                    className={`w-5 h-5 transition-colors ${
                      isSelected ? 'text-emerald-600' : 'text-gray-300'
                    }`}
                  />
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{meal.recipe.title}</h4>
                      {meal.planned_date && (
                        <span className="text-xs text-gray-500">
                          Planned for {meal.planned_date}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        {meal.recipe.cooking_time}m
                      </div>
                      {meal.recipe.servings && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Users className="w-3.5 h-3.5" />
                          {meal.recipe.servings}
                        </div>
                      )}
                    </div>
                  </div>

                  {meal.recipe.description && (
                    <p className="text-sm text-gray-600 mt-1">{meal.recipe.description}</p>
                  )}

                  {meal.recipe.tags && meal.recipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {meal.recipe.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 bg-white border border-gray-200 rounded-full text-gray-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => toggleExpanded(meal.meal_name)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* Expanded: ingredients preview */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
                  <div>
                    <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Ingredients ({meal.groceries.length})
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {meal.groceries.map((g) => (
                        <div key={g.name} className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1">
                          <CategoryBadge category={g.category} />
                          <span className="text-xs text-gray-700">{g.name}</span>
                          {g.quantity && <span className="text-xs text-gray-400">({g.quantity})</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSaveRecipe(meal)}
                      disabled={isSaving}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700
                                 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg
                                 transition-colors disabled:opacity-50"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      {isSaving ? 'Saving…' : 'Save Recipe'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Grocery breakdown by category */}
      {selectedMeals.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-600" />
            Pending Shopping List
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GROCERY_CATEGORIES.filter((cat) => groceriesByCategory[cat]?.length).map((cat) => (
              <div key={cat} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <CategoryBadge category={cat} />
                  <span className="text-xs text-gray-400">{groceriesByCategory[cat]!.length} items</span>
                </div>
                <ul className="space-y-1.5">
                  {groceriesByCategory[cat]!.map((g) => (
                    <li key={g.name} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{g.name}</span>
                      <span className="text-xs text-gray-400">{g.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <button
            onClick={handleAddToShoppingList}
            disabled={isAdding || selectedMeals.length === 0}
            className="
              w-full flex items-center justify-center gap-2 px-6 py-4
              bg-gradient-to-r from-emerald-600 to-emerald-500
              hover:from-emerald-700 hover:to-emerald-600
              disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed
              text-white font-semibold rounded-2xl shadow-md hover:shadow-lg
              transition-all duration-200 text-sm
            "
          >
            <Plus className="w-4 h-4" />
            {isAdding
              ? 'Adding to your lists…'
              : `Add ${selectedMeals.length} meal${selectedMeals.length !== 1 ? 's' : ''} to shopping list & plan`
            }
          </button>
        </div>
      )}
    </div>
  );
}
