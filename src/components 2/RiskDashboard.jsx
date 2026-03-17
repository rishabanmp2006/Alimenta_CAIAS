import HealthScoreRing from './HealthScoreRing';

export default function RiskDashboard({ healthScore, classified }) {
  if (!classified) return null;

  const counts = {
    safe: classified.filter(i => i.status === 'safe').length,
    risky: classified.filter(i => i.status === 'risky').length,
    avoid: classified.filter(i => i.status === 'avoid').length,
  };
  const total = classified.length;

  const bars = [
    { label: 'Safe', count: counts.safe, color: '#34c759', bg: 'bg-safe-bg' },
    { label: 'Caution', count: counts.risky, color: '#ff9f0a', bg: 'bg-risky-bg' },
    { label: 'Avoid', count: counts.avoid, color: '#ff3b30', bg: 'bg-avoid-bg' },
  ];

  return (
    <div className="card p-6">
      <div className="flex flex-col sm:flex-row items-center gap-8">
        {/* Ring */}
        <div className="shrink-0">
          <HealthScoreRing
            score={healthScore.score}
            label={healthScore.label}
            color={healthScore.color}
          />
        </div>

        {/* Bars */}
        <div className="flex-1 w-full space-y-5">
          {bars.map(bar => (
            <div key={bar.label}>
              <div className="flex justify-between text-[13px] mb-1.5">
                <span className="font-medium text-text-primary">{bar.label}</span>
                <span className="font-semibold" style={{ color: bar.color }}>
                  {bar.count}<span className="text-text-tertiary font-normal"> / {total}</span>
                </span>
              </div>
              <div className="h-2 bg-surface-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: total > 0 ? `${(bar.count / total) * 100}%` : '0%',
                    backgroundColor: bar.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
