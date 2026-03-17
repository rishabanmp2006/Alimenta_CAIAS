export default function HistoryItem({ item, onSelect, onRemove }) {
  const date = new Date(item.scannedAt);
  const timeAgo = getTimeAgo(date);

  return (
    <div
      className="card card-interactive p-4 flex items-center gap-4 cursor-pointer group"
      onClick={() => onSelect(item)}
    >
      {item.image ? (
        <img src={item.image} alt={item.name} className="w-12 h-12 object-contain rounded-xl bg-surface-secondary shrink-0" />
      ) : (
        <div className="w-12 h-12 rounded-xl bg-surface-secondary flex items-center justify-center shrink-0">
          <span className="text-text-tertiary text-lg">📦</span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-text-primary truncate">{item.name}</p>
        <p className="text-[12px] text-text-tertiary">{item.brand} · {timeAgo}</p>
      </div>

      {item.healthScore && (
        <div
          className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-bold"
          style={{
            backgroundColor: `${item.healthScore.color}12`,
            color: item.healthScore.color
          }}
        >
          {item.healthScore.score}
        </div>
      )}

      <button
        onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
        className="shrink-0 opacity-0 group-hover:opacity-100 w-8 h-8 rounded-full flex items-center justify-center text-text-tertiary hover:text-avoid hover:bg-avoid-bg transition-all text-[13px]"
      >
        ✕
      </button>
    </div>
  );
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}
