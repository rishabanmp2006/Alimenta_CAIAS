const STATUS_CONFIG = {
  safe: { emoji: '✅', bg: 'bg-safe/10', border: 'border-safe/30', text: 'text-safe', label: 'Safe' },
  risky: { emoji: '⚠️', bg: 'bg-risky/10', border: 'border-risky/30', text: 'text-risky', label: 'Risky' },
  avoid: { emoji: '❌', bg: 'bg-avoid/10', border: 'border-avoid/30', text: 'text-avoid', label: 'Avoid' },
  unknown: { emoji: '❓', bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400', label: 'Unknown' },
};

export default function IngredientCard({ ingredient, index }) {
  const config = STATUS_CONFIG[ingredient.status] || STATUS_CONFIG.unknown;

  return (
    <div
      className={`animate-fade-in-up p-4 rounded-xl border ${config.bg} ${config.border} transition-all duration-300 hover:scale-[1.02]`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">{config.emoji}</span>
            <h4 className="font-semibold text-slate-200 capitalize truncate">
              {ingredient.name}
            </h4>
          </div>
          <p className="text-sm text-slate-400 mt-1 line-clamp-2">
            {ingredient.description}
          </p>
          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {ingredient.isAdditive && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20 font-medium">
                Additive
              </span>
            )}
            {ingredient.isPreservative && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/20 font-medium">
                Preservative
              </span>
            )}
            {ingredient.isArtificial && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20 font-medium">
                Artificial
              </span>
            )}
          </div>
        </div>
        <span className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${config.bg} ${config.text} border ${config.border}`}>
          {config.label}
        </span>
      </div>
    </div>
  );
}
