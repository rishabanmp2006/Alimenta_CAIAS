import HealthScoreRing from './HealthScoreRing';

export default function CompareCard({ product, healthScore, classified, trustScore }) {
  if (!product) return null;

  const counts = classified ? {
    safe: classified.filter(i => i.status === 'safe').length,
    risky: classified.filter(i => i.status === 'risky').length,
    avoid: classified.filter(i => i.status === 'avoid').length,
  } : { safe: 0, risky: 0, avoid: 0 };

  return (
    <div className="glass-card p-5 flex flex-col items-center">
      {/* Product image */}
      {product.image && (
        <img
          src={product.image}
          alt={product.name}
          className="w-20 h-20 object-contain rounded-lg bg-white/5 mb-3"
        />
      )}

      {/* Product info */}
      <h4 className="text-sm font-bold text-slate-200 text-center mb-1">{product.name}</h4>
      <p className="text-xs text-slate-500 mb-4">{product.brand}</p>

      {/* Score */}
      {healthScore && (
        <HealthScoreRing
          score={healthScore.score}
          label={healthScore.label}
          color={healthScore.color}
          size={130}
        />
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2 mt-4 w-full">
        <div className="bg-safe/10 rounded-lg p-2 text-center">
          <p className="text-base font-bold text-safe">{counts.safe}</p>
          <p className="text-[9px] text-slate-500 uppercase">Safe</p>
        </div>
        <div className="bg-risky/10 rounded-lg p-2 text-center">
          <p className="text-base font-bold text-risky">{counts.risky}</p>
          <p className="text-[9px] text-slate-500 uppercase">Risky</p>
        </div>
        <div className="bg-avoid/10 rounded-lg p-2 text-center">
          <p className="text-base font-bold text-avoid">{counts.avoid}</p>
          <p className="text-[9px] text-slate-500 uppercase">Avoid</p>
        </div>
      </div>

      {/* Trust score */}
      {trustScore && (
        <div className="mt-3 w-full text-center">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: `${trustScore.color}15`, color: trustScore.color }}
          >
            Trust: {trustScore.level}
          </span>
        </div>
      )}

      {/* Ingredients count */}
      {classified && (
        <p className="text-xs text-slate-500 mt-3">
          {classified.length} ingredients analyzed
        </p>
      )}
    </div>
  );
}
