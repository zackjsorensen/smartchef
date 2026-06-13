'use client';

import { useState } from 'react';
import { useSmartChef } from '@/hooks/useSmartChef';
import { Navigation, type TabId } from '@/components/Navigation';
import { MealRequestForm } from '@/components/MealRequestForm';
import { PendingShoppingList } from '@/components/PendingShoppingList';
import { GroceryTracker } from '@/components/GroceryTracker';
import { RecipeViewer } from '@/components/RecipeViewer';
import { MealTodo } from '@/components/MealTodo';
import type { AIMealSuggestion } from '@/lib/types';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('planner');

  const {
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
    addMealPlan,
    markMealCooked,
    deleteMealPlan,
    saveRecipe,
    deleteRecipe,
  } = useSmartChef();

  // Derived counts for nav badges
  const pendingGroceryCount = groceries.filter((g) => g.status === 'needed').length;
  const urgentMealCount = mealPlans.filter((m) => {
    if (m.status !== 'pending') return false;
    return m.ingredients_used.some((gId) => {
      const g = groceries.find((g) => g.id === gId);
      if (!g?.expires_at) return false;
      const days = Math.ceil(
        (new Date(g.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return days <= 2;
    });
  }).length;

  const handleAddToShoppingList = async (meals: AIMealSuggestion[]) => {
    await addGroceriesFromAI(meals);
  };

  const handleAddToMealPlan = async (meal: AIMealSuggestion) => {
    // Find matching saved recipe
    const savedRecipe = recipes.find(
      (r) => r.title.toLowerCase() === meal.recipe.title.toLowerCase()
    );
    await addMealPlan({
      meal_name: meal.meal_name,
      planned_date: meal.planned_date ?? 'This week',
      status: 'pending',
      recipe_id: savedRecipe?.id,
      ingredients_used: [],
    });
  };

  const handleSaveRecipe = async (meal: AIMealSuggestion) => {
    await saveRecipe(meal.recipe);
  };

  const handleAddAllAndNavigate = async (meals: AIMealSuggestion[]) => {
    await addGroceriesFromAI(meals);
    for (const meal of meals) {
      await handleSaveRecipe(meal);
    }
    for (const meal of meals) {
      const savedRecipe = recipes.find(
        (r) => r.title.toLowerCase() === meal.recipe.title.toLowerCase()
      );
      await addMealPlan({
        meal_name: meal.meal_name,
        planned_date: meal.planned_date ?? 'This week',
        status: 'pending',
        recipe_id: savedRecipe?.id,
        ingredients_used: [],
      });
    }
    clearPendingPlan();
    setActiveTab('grocery');
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading SmartChef…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingGroceryCount={pendingGroceryCount}
        urgentMealCount={urgentMealCount}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* ── Section A: Meal Planner ──────────────────────────────────────── */}
        {activeTab === 'planner' && (
          <div className="space-y-10">
            <MealRequestForm
              onSubmit={generateMealPlan}
              isLoading={isLoadingAI}
              error={aiError}
            />

            {pendingAIPlan && (
              <div className="border-t border-gray-200 pt-8">
                <PendingShoppingList
                  plan={pendingAIPlan}
                  onAddToShoppingList={handleAddAllAndNavigate}
                  onSaveRecipe={handleSaveRecipe}
                  onAddToMealPlan={handleAddToMealPlan}
                  onDismiss={clearPendingPlan}
                />
              </div>
            )}
          </div>
        )}

        {/* ── Section B: Grocery Tracker ──────────────────────────────────── */}
        {activeTab === 'grocery' && (
          <GroceryTracker
            groceries={groceries}
            onMarkBought={markGroceryBought}
            onMarkNeeded={markGroceryNeeded}
            onDelete={deleteGrocery}
          />
        )}

        {/* ── Section C: Recipe Viewer ────────────────────────────────────── */}
        {activeTab === 'recipes' && (
          <RecipeViewer
            mealPlans={mealPlans}
            recipes={recipes}
            groceries={groceries}
            onMarkCooked={markMealCooked}
            onDeleteMealPlan={deleteMealPlan}
            onDeleteRecipe={deleteRecipe}
          />
        )}

        {/* ── Section D: Smart Cook Planner ───────────────────────────────── */}
        {activeTab === 'todo' && (
          <MealTodo
            mealPlans={mealPlans}
            recipes={recipes}
            groceries={groceries}
            onMarkCooked={markMealCooked}
            onNavigateToRecipe={() => setActiveTab('recipes')}
          />
        )}
      </main>
    </div>
  );
}
