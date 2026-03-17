import { useState, useCallback } from 'react';

export default function SmartSummary({ summary, productName }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleVoice = useCallback(() => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in your browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(summary);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }, [summary, isSpeaking]);

  return (
    <div className="glass-card p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-200 mb-2 flex items-center gap-2">
            <span>💡</span> Smart Summary
          </h3>
          {productName && (
            <p className="text-accent text-sm font-medium mb-2">{productName}</p>
          )}
          <p className="text-slate-300 leading-relaxed text-sm">{summary}</p>
        </div>
        <button
          onClick={handleVoice}
          className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
            isSpeaking
              ? 'bg-accent/20 text-accent animate-pulse'
              : 'bg-dark-600 text-slate-400 hover:text-accent hover:bg-accent/10'
          }`}
          title={isSpeaking ? 'Stop reading' : 'Read aloud'}
        >
          {isSpeaking ? '⏸️' : '🔊'}
        </button>
      </div>
    </div>
  );
}
