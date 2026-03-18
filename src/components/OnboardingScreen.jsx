import { useState } from 'react';
import { CONDITIONS, useUserProfile } from '../contexts/UserProfileContext';

export default function OnboardingScreen() {
  const { saveProfile } = useUserProfile();
  const [step, setStep] = useState(0); // 0 = name, 1 = conditions
  const [name, setName] = useState('');
  const [selected, setSelected] = useState([]);

  const toggle = (key) => {
    setSelected(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleDone = () => {
    saveProfile({
      name: name.trim() || 'You',
      conditions: selected,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-black flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-surface-secondary">
        <div
          className="h-full bg-accent transition-all duration-500"
          style={{ width: step === 0 ? '50%' : '100%' }}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-10 max-w-lg mx-auto w-full">

        {step === 0 && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-10">
              <div className="text-6xl mb-4">👋</div>
              <h1 className="text-[32px] font-extrabold text-text-primary tracking-tight">
                Welcome to Alimenta
              </h1>
              <p className="text-[16px] text-text-secondary mt-3">
                Let's personalise your experience so every scan is relevant to <em>you</em>.
              </p>
            </div>

            <div className="space-y-4">
              <label className="block">
                <p className="text-[13px] font-semibold text-text-tertiary uppercase tracking-wide mb-2">
                  What should we call you?
                </p>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="w-full bg-surface-secondary rounded-2xl px-5 py-4 text-[16px] text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </label>
            </div>

            <button
              onClick={() => setStep(1)}
              className="mt-8 w-full bg-accent hover:bg-blue-600 text-white py-4 rounded-2xl text-[16px] font-bold transition-all"
            >
              Next →
            </button>

            <button
              onClick={handleDone}
              className="mt-3 w-full text-text-tertiary text-[13px] py-2"
            >
              Skip setup — use without personalisation
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="animate-fade-in-up">
            <div className="mb-8">
              <h2 className="text-[28px] font-extrabold text-text-primary tracking-tight">
                Any health conditions?
              </h2>
              <p className="text-[15px] text-text-secondary mt-2">
                Select all that apply. Alimenta will show personalised warnings on every scan.
              </p>
            </div>

            <div className="space-y-2 mb-8">
              {CONDITIONS.map(c => {
                const isSelected = selected.includes(c.key);
                return (
                  <button
                    key={c.key}
                    onClick={() => toggle(c.key)}
                    className={`w-full p-4 rounded-2xl flex items-center gap-4 text-left transition-all border-2 ${
                      isSelected
                        ? 'border-accent bg-accent/5'
                        : 'border-border-light bg-surface hover:border-border'
                    }`}
                  >
                    <span className="text-2xl shrink-0">{c.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[14px] font-semibold ${isSelected ? 'text-accent' : 'text-text-primary'}`}>
                        {c.label}
                      </p>
                      <p className="text-[12px] text-text-tertiary mt-0.5">{c.desc}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      isSelected ? 'bg-accent border-accent' : 'border-border'
                    }`}>
                      {isSelected && <span className="text-white text-[12px]">✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="sticky bottom-0 pb-6 bg-white dark:bg-black pt-2">
              <button
                onClick={handleDone}
                className="w-full bg-accent hover:bg-blue-600 text-white py-4 rounded-2xl text-[16px] font-bold transition-all shadow-lg"
              >
                {selected.length > 0
                  ? `Start with ${selected.length} condition${selected.length > 1 ? 's' : ''} →`
                  : 'Start without conditions →'
                }
              </button>
              <button
                onClick={() => setStep(0)}
                className="mt-2 w-full text-text-tertiary text-[13px] py-2"
              >
                ← Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
