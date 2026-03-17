export default function QuickDecision({ healthScore }) {
  if (!healthScore) return null;

  let decision, badgeClass, bgColor;

  if (healthScore.score >= 70) {
    decision = 'SAFE';
    badgeClass = 'text-[#1a7a34] bg-safe-bg';
    bgColor = '#34c759';
  } else if (healthScore.score >= 40) {
    decision = 'MODERATE';
    badgeClass = 'text-[#9a5c00] bg-risky-bg';
    bgColor = '#ff9f0a';
  } else {
    decision = 'AVOID';
    badgeClass = 'text-[#c5221f] bg-avoid-bg';
    bgColor = '#ff3b30';
  }

  return (
    <div className="card p-6 flex items-center justify-between">
      <div>
        <p className="text-[13px] text-text-tertiary font-medium">Quick Decision</p>
        <p className="text-[28px] font-extrabold tracking-tight mt-1" style={{ color: bgColor }}>
          {decision}
        </p>
      </div>
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: `${bgColor}12` }}
      >
        <span className="text-[26px] font-extrabold" style={{ color: bgColor }}>{healthScore.score}</span>
      </div>
    </div>
  );
}
