import { useState } from 'react';

export default function SearchBar({ onSearch, onBarcode, onPaste, loading }) {
  const [mode, setMode] = useState('search');
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (mode === 'barcode') onBarcode(input.trim());
    else if (mode === 'paste') onPaste(input.trim());
    else onSearch(input.trim());
  };

  const modes = [
    { key: 'search', label: 'Search', placeholder: 'Search for a product...' },
    { key: 'barcode', label: 'Barcode', placeholder: 'Enter barcode number...' },
    { key: 'paste', label: 'Paste Ingredients', placeholder: 'Paste full ingredient list...' },
  ];

  const currentMode = modes.find(m => m.key === mode);

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Mode tabs */}
      <div className="flex gap-1 mb-4 justify-center">
        {modes.map(m => (
          <button
            key={m.key}
            onClick={() => { setMode(m.key); setInput(''); }}
            className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 ${
              mode === m.key
                ? 'bg-text-primary text-white'
                : 'text-text-tertiary hover:text-text-primary hover:bg-white'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit}>
        {mode === 'paste' ? (
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={currentMode.placeholder}
            rows={4}
            className="w-full bg-white rounded-2xl px-5 py-4 text-[15px] text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 shadow-sm border border-border-light transition-all resize-none"
          />
        ) : (
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={currentMode.placeholder}
              className="w-full bg-white rounded-2xl pl-11 pr-28 py-3.5 text-[15px] text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 shadow-sm border border-border-light transition-all"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-text-primary hover:bg-black disabled:opacity-30 disabled:cursor-not-allowed text-white px-5 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        )}
        {mode === 'paste' && (
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="mt-3 w-full bg-text-primary hover:bg-black disabled:opacity-30 text-white py-3 rounded-xl text-[14px] font-semibold transition-all duration-200"
          >
            {loading ? 'Analyzing...' : 'Analyze Ingredients'}
          </button>
        )}
      </form>
    </div>
  );
}
