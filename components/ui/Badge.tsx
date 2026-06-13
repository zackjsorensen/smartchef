'use client';

import type { GroceryCategory } from '@/lib/types';

const CATEGORY_COLORS: Record<GroceryCategory, string> = {
  'Produce':        'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Meat & Seafood': 'bg-red-100 text-red-800 border-red-200',
  'Dairy & Eggs':   'bg-blue-100 text-blue-800 border-blue-200',
  'Pantry':         'bg-amber-100 text-amber-800 border-amber-200',
  'Frozen':         'bg-cyan-100 text-cyan-800 border-cyan-200',
  'Bakery':         'bg-orange-100 text-orange-800 border-orange-200',
  'Beverages':      'bg-purple-100 text-purple-800 border-purple-200',
  'Other':          'bg-gray-100 text-gray-700 border-gray-200',
};

interface CategoryBadgeProps {
  category: GroceryCategory;
  className?: string;
}

export function CategoryBadge({ category, className = '' }: CategoryBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${CATEGORY_COLORS[category]} ${className}`}
    >
      {category}
    </span>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'red' | 'gray' | 'blue';
  className?: string;
}

const VARIANT_COLORS = {
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  amber:   'bg-amber-100 text-amber-800 border-amber-200',
  red:     'bg-red-100 text-red-800 border-red-200',
  gray:    'bg-gray-100 text-gray-700 border-gray-200',
  blue:    'bg-blue-100 text-blue-800 border-blue-200',
};

export function Badge({ children, variant = 'gray', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${VARIANT_COLORS[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
