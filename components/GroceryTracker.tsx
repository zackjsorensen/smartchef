'use client';

import { useState } from 'react';
import {
  ShoppingCart, CheckCircle2, Circle, Trash2,
  Package, Refrigerator, Filter, Search
} from 'lucide-react';
import type { Grocery, GroceryCategory } from '@/lib/types';
import { GROCERY_CATEGORIES } from '@/lib/types';
import { CategoryBadge } from '@/components/ui/Badge';
import { FreshnessIndicator } from '@/components/ui/FreshnessIndicator';

interface GroceryTrackerProps {
  groceries: Grocery[];
  onMarkBought: (id: string) => Promise<void>;
  onMarkNeeded: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function GroceryTracker({ groceries, onMarkBought, onMarkNeeded, onDelete }: GroceryTrackerProps) {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<GroceryCategory | 'All'>('All');
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  const needed = groceries.filter((g) => g.status === 'needed');
  const bought = groceries.filter((g) => g.status === 'bought');

  const withLoading = async (id: string, fn: () => Promise<void>) => {
    setLoadingIds((prev) => new Set([...prev, id]));
    await fn();
    setLoadingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const filteredNeeded = needed.filter((g) => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'All' || g.category === filterCategory;
    return matchSearch && matchCat;
  });

  const filteredBought = bought.filter((g) => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'All' || g.category === filterCategory;
    return matchSearch && matchCat;
  });

  // Group bought items by category
  const boughtByCategory: Partial<Record<GroceryCategory, Grocery[]>> = {};
  for (const g of filteredBought) {
    if (!boughtByCategory[g.category]) boughtByCategory[g.category] = [];
    boughtByCategory[g.category]!.push(g);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-gray-900">Grocery Tracker</h2>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">{needed.length} to buy</span>
          <span className="text-gray-300">·</span>
          <span className="text-emerald-600 font-medium">{bought.length} in kitchen</span>
        </div>
      </div>

      {/* Filters */}
      {groceries.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search items…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as GroceryCategory | 'All')}
              className="pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                         bg-white appearance-none cursor-pointer"
            >
              <option value="All">All categories</option>
              {GROCERY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      )}

      {groceries.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── To Buy ────────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="font-semibold text-gray-800">To Buy</h3>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                {filteredNeeded.length}
              </span>
            </div>

            {filteredNeeded.length === 0 ? (
              <p className="text-sm text-gray-400 italic py-4 text-center">
                {needed.length === 0 ? 'All items have been bought!' : 'No items match your filter.'}
              </p>
            ) : (
              <div className="space-y-2">
                {filteredNeeded.map((g) => (
                  <GroceryItemCard
                    key={g.id}
                    grocery={g}
                    isLoading={loadingIds.has(g.id)}
                    onCheck={() => withLoading(g.id, () => onMarkBought(g.id))}
                    onUncheck={() => {}}
                    onDelete={() => withLoading(g.id, () => onDelete(g.id))}
                    variant="needed"
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── In My Kitchen ────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Refrigerator className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-800">In My Kitchen</h3>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                {filteredBought.length}
              </span>
            </div>

            {filteredBought.length === 0 ? (
              <p className="text-sm text-gray-400 italic py-4 text-center">
                {bought.length === 0 ? 'Check off items from your shopping list.' : 'No items match your filter.'}
              </p>
            ) : (
              <div className="space-y-4">
                {GROCERY_CATEGORIES.filter((cat) => boughtByCategory[cat]?.length).map((cat) => (
                  <div key={cat}>
                    <div className="flex items-center gap-2 mb-2">
                      <CategoryBadge category={cat} />
                      <span className="text-xs text-gray-400">{boughtByCategory[cat]!.length}</span>
                    </div>
                    <div className="space-y-2">
                      {boughtByCategory[cat]!.map((g) => (
                        <GroceryItemCard
                          key={g.id}
                          grocery={g}
                          isLoading={loadingIds.has(g.id)}
                          onCheck={() => {}}
                          onUncheck={() => withLoading(g.id, () => onMarkNeeded(g.id))}
                          onDelete={() => withLoading(g.id, () => onDelete(g.id))}
                          variant="bought"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Grocery Item Card ────────────────────────────────────────────────────────

interface GroceryItemCardProps {
  grocery: Grocery;
  isLoading: boolean;
  onCheck: () => void;
  onUncheck: () => void;
  onDelete: () => void;
  variant: 'needed' | 'bought';
}

function GroceryItemCard({ grocery: g, isLoading, onCheck, onUncheck, onDelete, variant }: GroceryItemCardProps) {
  return (
    <div
      className={`
        group flex items-start gap-3 p-3 rounded-xl border transition-all duration-150
        ${variant === 'bought'
          ? 'bg-white border-emerald-100 shadow-sm'
          : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'
        }
      `}
    >
      {/* Toggle button */}
      <button
        onClick={variant === 'needed' ? onCheck : onUncheck}
        disabled={isLoading}
        className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110 disabled:opacity-50"
      >
        {variant === 'bought' ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        ) : (
          <Circle className="w-5 h-5 text-gray-300 group-hover:text-gray-400" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-sm font-medium ${variant === 'bought' ? 'text-gray-700' : 'text-gray-900'}`}>
            {g.name}
          </span>
          {g.quantity && (
            <span className="text-xs text-gray-400 flex-shrink-0">{g.quantity}</span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <CategoryBadge category={g.category} />
          {variant === 'bought' && g.date_bought && (
            <span className="text-xs text-gray-400">
              Bought {new Date(g.date_bought).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>

        {variant === 'bought' && g.expires_at && (
          <FreshnessIndicator expiresAt={g.expires_at} className="mt-1" />
        )}
      </div>

      {/* Delete */}
      <button
        onClick={onDelete}
        disabled={isLoading}
        className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100
                   transition-all duration-150 flex-shrink-0 disabled:opacity-20"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
      <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center">
        <Package className="w-8 h-8 text-emerald-300" />
      </div>
      <div>
        <p className="font-semibold text-gray-700">Your grocery list is empty</p>
        <p className="text-sm text-gray-400 mt-1">
          Use the Meal Planner to generate a shopping list automatically.
        </p>
      </div>
    </div>
  );
}
