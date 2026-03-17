const STATUS_CONFIG = {
  safe: { dot: 'bg-safe', text: 'text-[#1a7a34]', bg: 'bg-safe-bg', label: 'Safe' },
  risky: { dot: 'bg-risky', text: 'text-[#9a5c00]', bg: 'bg-risky-bg', label: 'Caution' },
  avoid: { dot: 'bg-avoid', text: 'text-[#c5221f]', bg: 'bg-avoid-bg', label: 'Avoid' },
  unknown: { dot: 'bg-text-tertiary', text: 'text-text-secondary', bg: 'bg-surface-secondary', label: 'Unknown' },
};

export default function IngredientCard({ ingredient, index }) {
  const config = STATUS_CONFIG[ingredient.status] || STATUS_CONFIG.unknown;

  return (
    <div
      className="animate-fade-in-up flex items-start gap-3 p-4 rounded-2xl bg-white border border-border-light hover:shadow-sm transition-all duration-200"
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${config.dot}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-[14px] font-semibold text-text-primary capitalize">
            {ingredient.name}
          </h4>
          <span className={`badge ${config.bg} ${config.text}`}>
            {config.label}
          </span>
        </div>
        <p className="text-[13px] text-text-secondary mt-1 leading-relaxed">
          {ingredient.description}
        </p>
        {(ingredient.isAdditive || ingredient.isPreservative || ingredient.isArtificial) && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {ingredient.isAdditive && <span className="badge badge-neutral text-[11px]">Additive</span>}
            {ingredient.isPreservative && <span className="badge badge-neutral text-[11px]">Preservative</span>}
            {ingredient.isArtificial && <span className="badge badge-neutral text-[11px]">Artificial</span>}
          </div>
        )}
      </div>
    </div>
  );
}
