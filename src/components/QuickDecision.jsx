export default function QuickDecision({ healthScore }) {
  if (!healthScore) return null;

  let decision, emoji, bgClass, borderClass, textClass, glowColor;

  if (healthScore.score >= 70) {
    decision = 'SAFE';
    emoji = '✅';
    bgClass = 'bg-safe/10';
    borderClass = 'border-safe/40';
    textClass = 'text-safe';
    glowColor = '#22c55e';
  } else if (healthScore.score >= 40) {
    decision = 'RISKY';
    emoji = '⚠️';
    bgClass = 'bg-risky/10';
    borderClass = 'border-risky/40';
    textClass = 'text-risky';
    glowColor = '#f59e0b';
  } else {
    decision = 'AVOID';
    emoji = '❌';
    bgClass = 'bg-avoid/10';
    borderClass = 'border-avoid/40';
    textClass = 'text-avoid';
    glowColor = '#ef4444';
  }

  return (
    <div className={`glass-card p-6 ${bgClass} border ${borderClass}`}>
      <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
        <span>⚡</span> Quick Decision
      </h3>
      <div className="text-center">
        <div
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl border-2 animate-pulse-glow"
          style={{ borderColor: glowColor, color: glowColor }}
        >
          <span className="text-4xl">{emoji}</span>
          <span className="text-3xl font-black tracking-wider">{decision}</span>
        </div>
        <p className="text-sm text-slate-400 mt-3">
          Score: <span className={`font-bold ${textClass}`}>{healthScore.score}/100</span>
        </p>
      </div>
    </div>
  );
}
