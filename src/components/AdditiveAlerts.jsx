/**
 * AdditiveAlerts — shows urgent red-flag callouts for the most dangerous ingredients
 * Goes above everything else on the result page for maximum impact
 */

const BANNED_IN = {
  'titanium dioxide': ['EU (banned 2022)'],
  'potassium bromate': ['EU', 'UK', 'Canada', 'Brazil'],
  'brominated vegetable oil': ['EU', 'UK', 'Japan'],
  'azodicarbonamide': ['EU', 'Australia', 'UK'],
  'red 3': ['EU (as food dye)'],
  'propylene glycol': ['EU (restricted)'],
  'tbhq': ['EU (restricted)'],
  'bha': ['EU (restricted)'],
  'caramel colour': ['California (prop 65 warning)'],
};

export default function AdditiveAlerts({ classified }) {
  if (!classified?.length) return null;

  const alerts = classified
    .filter(i => i.status === 'avoid')
    .map(i => {
      const bans = BANNED_IN[i.name.toLowerCase()];
      return { ...i, bans };
    })
    .filter(i => i.bans || i.status === 'avoid')
    .slice(0, 3);

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="section-title">⚠️ Red Flags</p>
      {alerts.map((alert, idx) => (
        <div key={idx} className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <span className="text-red-500 text-xl shrink-0">🚫</span>
            <div>
              <p className="text-[13px] font-bold text-red-700 capitalize">{alert.name}</p>
              <p className="text-[12px] text-red-600 mt-0.5">{alert.description}</p>
              {alert.bans && (
                <p className="text-[11px] text-red-400 mt-1 font-medium">
                  Banned / restricted in: {alert.bans.join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
