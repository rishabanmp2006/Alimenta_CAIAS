export default function HiddenDangers({ dangers, summary }) {
  if (!dangers) return null;

  const sections = [
    { key: 'additives', label: 'Additives', icon: '🧪', color: 'purple', items: dangers.additives },
    { key: 'preservatives', label: 'Preservatives', icon: '🧊', color: 'orange', items: dangers.preservatives },
    { key: 'artificial', label: 'Artificial', icon: '⚗️', color: 'red', items: dangers.artificial },
  ];

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-bold text-slate-200 mb-2 flex items-center gap-2">
        <span>🔍</span> Hidden Danger Detector
      </h3>
      {summary && (
        <p className="text-sm text-slate-400 mb-4">{summary}</p>
      )}

      {dangers.totalDangers === 0 ? (
        <div className="text-center py-6">
          <span className="text-3xl">🎉</span>
          <p className="text-safe font-medium mt-2">No hidden dangers detected!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map(section => {
            if (section.items.length === 0) return null;
            return (
              <div key={section.key}>
                <div className="flex items-center gap-2 mb-2">
                  <span>{section.icon}</span>
                  <span className={`text-sm font-semibold text-${section.color}-400`}>
                    {section.label} ({section.items.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {section.items.map((item, idx) => (
                    <span
                      key={idx}
                      className={`text-xs px-2.5 py-1 rounded-full bg-${section.color}-500/10 text-${section.color}-400 border border-${section.color}-500/20 font-medium capitalize`}
                    >
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
