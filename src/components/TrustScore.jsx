export default function TrustScore({ trustScore }) {
  if (!trustScore) return null;

  return (
    <div className="card p-5 flex items-center gap-4">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${trustScore.color}12` }}
      >
        <span className="text-xl font-bold" style={{ color: trustScore.color }}>
          {trustScore.level === 'Good' ? '✓' : trustScore.level === 'Moderate' ? '~' : '!'}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wide">Trust Score</p>
        <p className="text-[16px] font-bold mt-0.5" style={{ color: trustScore.color }}>
          {trustScore.level}
        </p>
        <p className="text-[12px] text-text-tertiary mt-0.5 leading-snug">{trustScore.description}</p>
      </div>
    </div>
  );
}
