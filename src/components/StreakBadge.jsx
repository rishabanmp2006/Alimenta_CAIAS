export default function StreakBadge({ streak }) {
  if (!streak || streak.totalScans === 0) return null;

  return (
    <div className="card p-4 flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-2xl shrink-0">
        🔥
      </div>
      <div className="flex-1">
        <p className="text-[13px] font-semibold text-text-primary">
          {streak.current} day streak
        </p>
        <p className="text-[11px] text-text-tertiary">
          {streak.totalScans} total scans · Best: {streak.best} days
        </p>
      </div>
      {streak.current >= 3 && (
        <span className="text-[11px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-full">
          {streak.current >= 7 ? '🏆 Week!' : streak.current >= 5 ? '⭐ Hot!' : '🌟 Nice!'}
        </span>
      )}
    </div>
  );
}
