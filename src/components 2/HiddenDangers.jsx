export default function HiddenDangers({ dangers, summary }) {
  if (!dangers) return null;

  const sections = [
    { key: 'additives', label: 'Additives', items: dangers.additives, badgeClass: 'badge-risky' },
    { key: 'preservatives', label: 'Preservatives', items: dangers.preservatives, badgeClass: 'badge-risky' },
    { key: 'artificial', label: 'Artificial', items: dangers.artificial, badgeClass: 'badge-avoid' },
  ];

  return (
    <div>
      <p className="section-title">Hidden Dangers</p>
      {dangers.totalDangers === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-safe font-semibold text-[15px]">No hidden dangers detected</p>
          <p className="text-text-tertiary text-[13px] mt-1">All clear — no additives, preservatives, or artificial ingredients found.</p>
        </div>
      ) : (
        <div className="card p-5 space-y-5">
          {summary && (
            <p className="text-[13px] text-text-secondary">{summary}</p>
          )}
          {sections.map(section => {
            if (section.items.length === 0) return null;
            return (
              <div key={section.key}>
                <p className="text-[12px] font-semibold text-text-tertiary uppercase tracking-wide mb-2">
                  {section.label} ({section.items.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {section.items.map((item, idx) => (
                    <span key={idx} className={`badge ${section.badgeClass} capitalize`}>
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
