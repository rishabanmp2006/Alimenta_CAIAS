import { useState } from 'react';
import IngredientCard from './IngredientCard';

export default function IngredientList({ ingredients }) {
  const [filter, setFilter] = useState('all');

  if (!ingredients || ingredients.length === 0) return null;

  const filters = [
    { key: 'all', label: 'All', count: ingredients.length },
    { key: 'safe', label: '✅ Safe', count: ingredients.filter(i => i.status === 'safe').length },
    { key: 'risky', label: '⚠️ Risky', count: ingredients.filter(i => i.status === 'risky').length },
    { key: 'avoid', label: '❌ Avoid', count: ingredients.filter(i => i.status === 'avoid').length },
  ];

  const filtered = filter === 'all'
    ? ingredients
    : ingredients.filter(i => i.status === filter);

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
        <span>🧪</span> Ingredient Breakdown
      </h3>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 bg-dark-800 rounded-xl p-1 overflow-x-auto">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex-1 min-w-fit py-1.5 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              filter === f.key
                ? 'bg-accent/20 text-accent'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Ingredient grid */}
      <div className="grid gap-3 max-h-[500px] overflow-y-auto pr-1">
        {filtered.map((ing, idx) => (
          <IngredientCard key={ing.name + idx} ingredient={ing} index={idx} />
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-8">
            No ingredients in this category.
          </p>
        )}
      </div>
    </div>
  );
}
