import HealthScoreRing from './HealthScoreRing';

export default function RiskDashboard({ healthScore, classified }) {
  if (!classified) return null;

  const counts = {
    safe: classified.filter(i => i.status === 'safe').length,
    risky: classified.filter(i => i.status === 'risky').length,
    avoid: classified.filter(i => i.status === 'avoid').length,
    unknown: classified.filter(i => i.status === 'unknown').length,
  };

  const total = classified.length;

  const bars = [
    { label: 'Safe', count: counts.safe, color: '#22c55e', bg: 'bg-safe/20' },
    { label: 'Moderate', count: counts.risky, color: '#f59e0b', bg: 'bg-risky/20' },
    { label: 'Harmful', count: counts.avoid, color: '#ef4444', bg: 'bg-avoid/20' },
  ];

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-bold text-slate-200 mb-5 flex items-center gap-2">
        <span>📊</span> Risk Dashboard
      </h3>
      
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Score Ring */}
        <div className="shrink-0">
          <HealthScoreRing
            score={healthScore.score}
            label={healthScore.label}
            color={healthScore.color}
          />
        </div>

        {/* Breakdown bars */}
        <div className="flex-1 w-full space-y-4">
          {bars.map(bar => (
            <div key={bar.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300 font-medium">{bar.label}</span>
                <span style={{ color: bar.color }} className="font-bold">
                  {bar.count} / {total}
                </span>
              </div>
              <div className="h-2.5 bg-dark-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: total > 0 ? `${(bar.count / total) * 100}%` : '0%',
                    backgroundColor: bar.color,
                    boxShadow: `0 0 8px ${bar.color}40`
                  }}
                />
              </div>
            </div>
          ))}

          {/* Stats row */}
          <div className="flex gap-3 pt-2">
            <div className="flex-1 bg-dark-700 rounded-lg p-2.5 text-center">
              <p className="text-lg font-bold text-slate-200">{total}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Total</p>
            </div>
            <div className="flex-1 bg-dark-700 rounded-lg p-2.5 text-center">
              <p className="text-lg font-bold text-safe">{counts.safe}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Safe</p>
            </div>
            <div className="flex-1 bg-dark-700 rounded-lg p-2.5 text-center">
              <p className="text-lg font-bold text-avoid">{counts.avoid}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Avoid</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
