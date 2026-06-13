'use client';

import { getFreshnessLevel, getDaysRemaining, type FreshnessLevel } from '@/lib/types';

interface FreshnessIndicatorProps {
  expiresAt: string | undefined;
  className?: string;
}

const CONFIG: Record<FreshnessLevel, { bg: string; text: string; bar: string; label: string }> = {
  fresh:   { bg: 'bg-emerald-50',  text: 'text-emerald-700',  bar: 'bg-emerald-500', label: 'Fresh' },
  warning: { bg: 'bg-amber-50',    text: 'text-amber-700',    bar: 'bg-amber-400',   label: 'Use soon' },
  urgent:  { bg: 'bg-red-50',      text: 'text-red-700',      bar: 'bg-red-500',     label: 'Use today!' },
  expired: { bg: 'bg-gray-100',    text: 'text-gray-500',     bar: 'bg-gray-400',    label: 'Expired' },
};

export function FreshnessIndicator({ expiresAt, className = '' }: FreshnessIndicatorProps) {
  const days = getDaysRemaining(expiresAt);
  const level = getFreshnessLevel(days);
  const { bg, text, bar, label } = CONFIG[level];

  const cappedDays = Math.min(Math.max(days, 0), 14);
  const pct = (cappedDays / 14) * 100;

  const displayDays =
    days <= 0
      ? 'Expired'
      : days === 1
      ? '1 day left'
      : `${days} days left`;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${bg} ${text}`}>
          {label}
        </span>
        <span className={`text-xs font-medium ${text}`}>{displayDays}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
