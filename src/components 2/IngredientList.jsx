import { useState } from 'react';
import IngredientCard from './IngredientCard';

export default function IngredientList({ ingredients }) {
  const [filter, setFilter] = useState('all');

  if (!ingredients || ingredients.length === 0) return null;

  const counts = {
    all: ingredients.length,
    safe: ingredients.filter(i => i.status === 'safe').length,
    risky: ingredients.filter(i => i.status === 'risky').length,
    avoid: ingredients.filter(i => i.status === 'avoid').length,
  };

  const filtered = filter === 'all'
    ? ingredients
    : ingredients.filter(i => i.status === filter);

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'avoid', label: 'Avoid' },
    { key: 'risky', label: 'Caution' },
    { key: 'safe', label: 'Safe' },
  ];

  return (
    <div>
      <p className="section-title">Key Ingredient Risks</p>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 ${
              filter === t.key
                ? 'bg-text-primary text-white'
                : 'bg-white text-text-secondary hover:text-text-primary border border-border-light'
            }`}
          >
            {t.label}
            <span className="ml-1 opacity-60">{counts[t.key]}</span>
          </button>
        ))}
      </div>

      {/* Ingredients */}
      <div className="space-y-2">
        {filtered.map((ing, idx) => (
          <IngredientCard key={ing.name + idx} ingredient={ing} index={idx} />
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-text-tertiary text-center py-12">
            No ingredients in this category.
          </p>
        )}
      </div>
    </div>
  );
}
