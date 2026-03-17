export default function AlternativeSuggestions({ alternatives, category }) {
  if (!alternatives || alternatives.length === 0) return null;

  return (
    <div>
      <p className="section-title">Healthier Alternatives</p>
      <div className="space-y-2">
        {alternatives.map((alt, idx) => (
          <div
            key={idx}
            className="card card-interactive flex items-center gap-4 p-4 animate-fade-in-up"
            style={{ animationDelay: `${idx * 0.08}s` }}
          >
            <div className="shrink-0 w-11 h-11 rounded-2xl bg-safe-bg flex items-center justify-center">
              <span className="text-safe font-bold text-[14px]">{alt.healthScore}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-text-primary">{alt.name}</p>
              <p className="text-[12px] text-text-tertiary mt-0.5">{alt.reason}</p>
            </div>
            <div className="shrink-0 w-14">
              <div className="h-1.5 bg-surface-secondary rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-safe" style={{ width: `${alt.healthScore}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
