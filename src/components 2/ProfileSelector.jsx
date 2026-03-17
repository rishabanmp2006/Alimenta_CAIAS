const profiles = [
  { key: 'general', label: 'General', desc: 'Standard' },
  { key: 'diabetic', label: 'Diabetic', desc: 'Sugar-focused' },
  { key: 'fitness', label: 'Fitness', desc: 'Macro-aware' },
  { key: 'child', label: 'Child', desc: 'Extra safe' },
];

export default function ProfileSelector({ selected, onChange }) {
  return (
    <div>
      <p className="section-title">Profile</p>
      <div className="grid grid-cols-4 gap-2">
        {profiles.map(p => (
          <button
            key={p.key}
            onClick={() => onChange(p.key)}
            className={`p-3 rounded-2xl text-center transition-all duration-200 ${
              selected === p.key
                ? 'bg-text-primary text-white shadow-md'
                : 'card border border-border-light text-text-secondary hover:border-text-tertiary'
            }`}
          >
            <span className="text-[13px] font-semibold block">{p.label}</span>
            <span className={`text-[11px] block mt-0.5 ${selected === p.key ? 'text-white/60' : 'text-text-tertiary'}`}>{p.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
