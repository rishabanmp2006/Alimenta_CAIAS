/**
 * PersonalisedWarnings — the star feature
 * Shows condition-specific warnings at the TOP of the result page
 */
export default function PersonalisedWarnings({ warnings, userName }) {
  if (!warnings || warnings.length === 0) return null;

  const dangers  = warnings.filter(w => w.severity === 'danger');
  const cautions = warnings.filter(w => w.severity === 'warning');
  const positives = warnings.filter(w => w.severity === 'safe_flag');

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="section-title mb-0">
          For {userName || 'You'}
        </p>
        {dangers.length > 0 && (
          <span className="text-[11px] font-bold text-white bg-red-500 px-2.5 py-1 rounded-full animate-pulse">
            {dangers.length} ALERT{dangers.length > 1 ? 'S' : ''}
          </span>
        )}
      </div>

      {/* Danger alerts */}
      {dangers.map((w, i) => (
        <div key={i} className="rounded-2xl bg-red-50 border-2 border-red-300 p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl shrink-0 mt-0.5">{w.conditionEmoji}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold text-red-500 uppercase tracking-wide">
                  {w.conditionLabel}
                </span>
                <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold">
                  AVOID
                </span>
              </div>
              <p className="text-[13px] font-semibold text-red-800">{w.message}</p>
              <p className="text-[11px] text-red-500 mt-1">
                Found: <span className="font-medium capitalize">{w.ingredient}</span>
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Warning alerts */}
      {cautions.map((w, i) => (
        <div key={i} className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl shrink-0 mt-0.5">{w.conditionEmoji}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wide">
                  {w.conditionLabel}
                </span>
                <span className="text-[10px] bg-amber-400 text-white px-1.5 py-0.5 rounded font-bold">
                  CAUTION
                </span>
              </div>
              <p className="text-[13px] font-semibold text-amber-800">{w.message}</p>
              <p className="text-[11px] text-amber-500 mt-1">
                Found: <span className="font-medium capitalize">{w.ingredient}</span>
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Positive flags */}
      {positives.map((w, i) => (
        <div key={i} className="rounded-2xl bg-green-50 border border-green-200 p-3">
          <div className="flex items-center gap-3">
            <div className="text-xl shrink-0">{w.conditionEmoji}</div>
            <p className="text-[13px] text-green-700 font-medium">{w.message}</p>
          </div>
        </div>
      ))}

      {/* All clear */}
      {dangers.length === 0 && cautions.length === 0 && positives.length === 0 && (
        <div className="rounded-2xl bg-green-50 border border-green-200 p-4 text-center">
          <p className="text-[15px] font-bold text-green-700">✅ Safe for you</p>
          <p className="text-[12px] text-green-600 mt-1">
            No issues found for your health profile
          </p>
        </div>
      )}
    </div>
  );
}
