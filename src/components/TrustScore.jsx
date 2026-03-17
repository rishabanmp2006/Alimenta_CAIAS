export default function TrustScore({ trustScore }) {
  if (!trustScore) return null;

  const levelIcons = { Good: '🛡️', Moderate: '⚖️', Poor: '⚠️', Unknown: '❓' };

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
        <span>🔐</span> Trust Score
      </h3>
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl"
          style={{ backgroundColor: `${trustScore.color}15`, border: `2px solid ${trustScore.color}40` }}
        >
          {levelIcons[trustScore.level] || '❓'}
        </div>
        <div>
          <p className="text-xl font-bold" style={{ color: trustScore.color }}>
            {trustScore.level}
          </p>
          <p className="text-sm text-slate-400 mt-0.5">{trustScore.description}</p>
        </div>
      </div>
    </div>
  );
}
