'use client';

import { ShoppingCart, Refrigerator, BookOpen, AlertTriangle, ChefHat } from 'lucide-react';

export type TabId = 'planner' | 'grocery' | 'recipes' | 'todo';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface NavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  pendingGroceryCount: number;
  urgentMealCount: number;
}

export function Navigation({ activeTab, onTabChange, pendingGroceryCount, urgentMealCount }: NavigationProps) {
  const tabs: Tab[] = [
    { id: 'planner',  label: 'Meal Planner', icon: ChefHat,       badge: pendingGroceryCount > 0 ? pendingGroceryCount : undefined },
    { id: 'grocery',  label: 'Groceries',    icon: ShoppingCart,  },
    { id: 'recipes',  label: 'Recipes',      icon: BookOpen,      },
    { id: 'todo',     label: 'Cook Now',     icon: AlertTriangle, badge: urgentMealCount > 0 ? urgentMealCount : undefined },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      {/* Brand bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-sm">
            <ChefHat className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-amber-500 bg-clip-text text-transparent">
            SmartChef
          </span>
        </div>
        <span className="text-xs text-gray-400 hidden sm:block">AI-powered meal planning</span>
      </div>

      {/* Tabs */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex gap-1 overflow-x-auto pb-0 scrollbar-hide">
          {tabs.map(({ id, label, icon: Icon, badge }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className={`
                  relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap
                  transition-all duration-200 border-b-2 -mb-px
                  ${isActive
                    ? 'border-emerald-500 text-emerald-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : ''}`} />
                <span className="hidden sm:inline">{label}</span>
                {badge !== undefined && (
                  <span className="absolute -top-0.5 right-0.5 w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
