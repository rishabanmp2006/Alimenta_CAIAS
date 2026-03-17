import HealthScoreRing from './HealthScoreRing';

export default function CompareCard({ product, healthScore, classified, trustScore }) {
  if (!product) return null;

  const counts = classified ? {
    safe: classified.filter(i => i.status === 'safe').length,
    risky: classified.filter(i => i.status === 'risky').length,
    avoid: classified.filter(i => i.status === 'avoid').length,
  } : { safe: 0, risky: 0, avoid: 0 };

  return (
    <div className="card p-6 flex flex-col items-center text-center">
      {product.image && (
        <img
          src={product.image}
          alt={product.name}
          className="w-16 h-16 object-contain rounded-2xl bg-surface-secondary mb-4"
        />
      )}
      <h4 className="text-[15px] font-bold text-text-primary mb-0.5">{product.name}</h4>
      <p className="text-[12px] text-text-tertiary mb-5">{product.brand}</p>

      {healthScore && (
        <HealthScoreRing
          score={healthScore.score}
          label={healthScore.label}
          color={healthScore.color}
          size={120}
        />
      )}

      <div className="grid grid-cols-3 gap-2 mt-5 w-full">
        <div className="bg-safe-bg rounded-xl p-2.5">
          <p className="text-[16px] font-bold text-safe">{counts.safe}</p>
          <p className="text-[10px] text-text-tertiary uppercase">Safe</p>
        </div>
        <div className="bg-risky-bg rounded-xl p-2.5">
          <p className="text-[16px] font-bold text-risky">{counts.risky}</p>
          <p className="text-[10px] text-text-tertiary uppercase">Caution</p>
        </div>
        <div className="bg-avoid-bg rounded-xl p-2.5">
          <p className="text-[16px] font-bold text-avoid">{counts.avoid}</p>
          <p className="text-[10px] text-text-tertiary uppercase">Avoid</p>
        </div>
      </div>

      {trustScore && (
        <div className="mt-4 w-full">
          <span
            className="inline-block px-3 py-1 rounded-full text-[12px] font-semibold"
            style={{ backgroundColor: `${trustScore.color}12`, color: trustScore.color }}
          >
            Trust: {trustScore.level}
          </span>
        </div>
      )}
    </div>
  );
}
