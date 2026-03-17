export default function LongTermEffects({ effects, summary }) {
  if (!effects || effects.length === 0) return null;

  const getSeverityColor = (severity) => {
    if (severity >= 4) return { bg: 'bg-avoid/10', border: 'border-avoid/30', text: 'text-avoid', dot: 'bg-avoid' };
    if (severity >= 2) return { bg: 'bg-risky/10', border: 'border-risky/30', text: 'text-risky', dot: 'bg-risky' };
    return { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400', dot: 'bg-slate-400' };
  };

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-bold text-slate-200 mb-2 flex items-center gap-2">
        <span>⏳</span> Long-Term Effects
      </h3>
      {summary && (
        <p className="text-sm text-slate-400 mb-4 italic">{summary}</p>
      )}
      <div className="space-y-2">
        {effects.slice(0, 8).map((item, idx) => {
          const colors = getSeverityColor(item.severity);
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 p-3 rounded-lg ${colors.bg} border ${colors.border} animate-fade-in-up`}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${colors.dot}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${colors.text}`}>{item.effect}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  From: {item.sources.slice(0, 3).join(', ')}
                  {item.sources.length > 3 ? ` +${item.sources.length - 3} more` : ''}
                </p>
              </div>
              <div className="shrink-0 flex gap-0.5">
                {Array.from({ length: item.severity }, (_, i) => (
                  <div key={i} className={`w-1.5 h-3 rounded-sm ${colors.dot}`} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
