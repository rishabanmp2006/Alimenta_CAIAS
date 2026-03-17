const profiles = [
  { key: 'general', label: 'General', icon: '👤', desc: 'Standard analysis' },
  { key: 'diabetic', label: 'Diabetic', icon: '💉', desc: 'Sugar & GI focused' },
  { key: 'fitness', label: 'Fitness', icon: '💪', desc: 'Macro-optimized' },
  { key: 'child', label: 'Child', icon: '👶', desc: 'Extra caution on additives' },
];

export default function ProfileSelector({ selected, onChange }) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
        <span>🎯</span> Personalized Analysis
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {profiles.map(p => (
          <button
            key={p.key}
            onClick={() => onChange(p.key)}
            className={`p-3 rounded-xl border text-center transition-all duration-200 ${
              selected === p.key
                ? 'bg-accent/15 border-accent/40 text-accent shadow-lg shadow-accent/5'
                : 'bg-dark-700/50 border-dark-500 text-slate-400 hover:border-slate-500 hover:text-slate-200'
            }`}
          >
            <span className="text-2xl block mb-1">{p.icon}</span>
            <span className="text-sm font-semibold block">{p.label}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">{p.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
