'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Lightbulb, X } from 'lucide-react';

interface MealRequestFormProps {
  onSubmit: (prompt: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const EXAMPLE_PROMPTS = [
  'Chicken Parmesan on Tuesday, Mediterranean Chickpea Salad on Thursday',
  'Tacos on Monday, Salmon with asparagus on Wednesday, Pasta Carbonara on Friday',
  'Healthy salmon bowl for Monday, hearty beef stew for Sunday',
];

export function MealRequestForm({ onSubmit, isLoading, error }: MealRequestFormProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    await onSubmit(prompt.trim());
  };

  const useExample = (example: string) => {
    setPrompt(example);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">What do you want to cook this week?</h2>
        <p className="mt-1 text-gray-500">
          Describe your meals in plain English — SmartChef will generate recipes and build your grocery list automatically.
        </p>
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. I want to make Chicken Parmesan on Tuesday and a Mediterranean Chickpea Salad on Thursday..."
            rows={4}
            className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-2xl shadow-sm
                       placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                       resize-none text-sm leading-relaxed transition-shadow"
            disabled={isLoading}
          />
          {prompt && (
            <button
              type="button"
              onClick={() => setPrompt('')}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className="
            w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5
            bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600
            disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed
            text-white font-semibold rounded-2xl shadow-md hover:shadow-lg
            transition-all duration-200 text-sm
          "
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating recipes…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Recipes with AI
            </>
          )}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
          <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Example prompts */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
          <Lightbulb className="w-3.5 h-3.5" />
          Try one of these
        </div>
        <div className="flex flex-col gap-2">
          {EXAMPLE_PROMPTS.map((example, i) => (
            <button
              key={i}
              onClick={() => useExample(example)}
              disabled={isLoading}
              className="text-left px-4 py-3 bg-gradient-to-r from-emerald-50 to-amber-50
                         border border-emerald-100 rounded-xl text-sm text-gray-600
                         hover:border-emerald-300 hover:text-emerald-700
                         transition-all duration-150 disabled:opacity-50"
            >
              &ldquo;{example}&rdquo;
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
