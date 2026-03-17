export default function LongTermEffects({ effects, summary }) {
  if (!effects || effects.length === 0) return null;

  const getSeverityStyle = (s) => {
    if (s >= 4) return { dot: 'bg-avoid', text: 'text-[#c5221f]' };
    if (s >= 2) return { dot: 'bg-risky', text: 'text-[#9a5c00]' };
    return { dot: 'bg-text-tertiary', text: 'text-text-secondary' };
  };

  return (
    <div>
      <p className="section-title">Long-Term Effects</p>
      {summary && (
        <p className="text-[14px] text-text-secondary mb-4 leading-relaxed">{summary}</p>
      )}
      <div className="card divide-y divide-border-light">
        {effects.slice(0, 6).map((item, idx) => {
          const style = getSeverityStyle(item.severity);
          return (
            <div key={idx} className="flex items-start gap-3 p-4">
              <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${style.dot}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-[14px] font-medium ${style.text}`}>{item.effect}</p>
                <p className="text-[12px] text-text-tertiary mt-0.5">
                  {item.sources.slice(0, 3).join(', ')}
                </p>
              </div>
              <div className="shrink-0 flex gap-0.5 mt-1.5">
                {Array.from({ length: Math.min(item.severity, 5) }, (_, i) => (
                  <div key={i} className={`w-1 h-2.5 rounded-sm ${style.dot} opacity-70`} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
