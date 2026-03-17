export default function HistoryItem({ item, onSelect, onRemove }) {
  const date = new Date(item.scannedAt);
  const timeAgo = getTimeAgo(date);

  return (
    <div className="glass-card p-4 flex items-center gap-4 hover:border-accent/30 transition-all duration-200 cursor-pointer group"
      onClick={() => onSelect(item)}
    >
      {/* Image */}
      {item.image ? (
        <img
          src={item.image}
          alt={item.name}
          className="w-12 h-12 object-contain rounded-lg bg-white/5 shrink-0"
        />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-dark-600 flex items-center justify-center shrink-0">
          <span className="text-xl">📦</span>
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-200 truncate">{item.name}</p>
        <p className="text-xs text-slate-500">{item.brand} • {timeAgo}</p>
      </div>

      {/* Score badge */}
      {item.healthScore && (
        <div
          className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
          style={{
            backgroundColor: `${item.healthScore.color}15`,
            color: item.healthScore.color
          }}
        >
          {item.healthScore.score}
        </div>
      )}

      {/* Remove button */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
        className="shrink-0 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-avoid transition-all text-sm"
        title="Remove"
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
