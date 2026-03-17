export default function AlternativeSuggestions({ alternatives, category }) {
  if (!alternatives || alternatives.length === 0) return null;

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-bold text-slate-200 mb-1 flex items-center gap-2">
        <span>🔄</span> Healthier Alternatives
      </h3>
      <p className="text-xs text-slate-500 mb-4">
        Based on category: <span className="capitalize text-accent">{category}</span>
      </p>

      <div className="space-y-3">
        {alternatives.map((alt, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 p-3 bg-dark-700/50 rounded-xl border border-dark-500 hover:border-safe/30 transition-all animate-fade-in-up"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div className="shrink-0 w-10 h-10 rounded-lg bg-safe/10 flex items-center justify-center">
              <span className="text-safe font-bold text-sm">{alt.healthScore}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-200">{alt.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{alt.reason}</p>
            </div>
            <div className="shrink-0">
              <div className="w-12 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-safe"
                  style={{ width: `${alt.healthScore}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
