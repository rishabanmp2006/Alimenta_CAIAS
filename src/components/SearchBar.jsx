import { useState } from 'react';

export default function SearchBar({ onSearch, onBarcode, onPaste, loading }) {
  const [mode, setMode] = useState('search'); // 'search' | 'barcode' | 'paste'
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    if (mode === 'barcode') {
      onBarcode(input.trim());
    } else if (mode === 'paste') {
      onPaste(input.trim());
    } else {
      onSearch(input.trim());
    }
  };

  const modes = [
    { key: 'search', label: 'Search', icon: '🔍', placeholder: 'Search for a product (e.g., Nutella, Coca-Cola)...' },
    { key: 'barcode', label: 'Barcode', icon: '📷', placeholder: 'Enter barcode number (e.g., 3017620422003)...' },
    { key: 'paste', label: 'Paste', icon: '📋', placeholder: 'Paste ingredient list here...' },
  ];

  const currentMode = modes.find(m => m.key === mode);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Mode Toggle */}
      <div className="flex gap-1 mb-3 bg-dark-800 rounded-xl p-1">
        {modes.map(m => (
          <button
            key={m.key}
            onClick={() => { setMode(m.key); setInput(''); }}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${
              mode === m.key
                ? 'bg-accent/20 text-accent shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-dark-700'
            }`}
          >
            <span>{m.icon}</span>
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        {mode === 'paste' ? (
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={currentMode.placeholder}
            rows={4}
            className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all resize-none"
          />
        ) : (
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={currentMode.placeholder}
            className="w-full bg-dark-700 border border-dark-500 rounded-xl pl-4 pr-24 py-3.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all"
          />
        )}
        
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="mt-2 w-full sm:w-auto sm:absolute sm:right-1.5 sm:top-1.5 sm:mt-0 bg-accent hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <span>Analyze</span>
              <span>→</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
