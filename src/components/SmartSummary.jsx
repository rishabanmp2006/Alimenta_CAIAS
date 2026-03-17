import { useState, useCallback } from 'react';

export default function SmartSummary({ summary, productName }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleVoice = useCallback(() => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(summary);
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }, [summary, isSpeaking]);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="section-title mb-0">Summary</p>
        <button
          onClick={handleVoice}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-200 ${
            isSpeaking
              ? 'bg-accent text-white'
              : 'bg-surface-secondary text-text-tertiary hover:text-text-primary hover:bg-border-light'
          }`}
          title={isSpeaking ? 'Stop' : 'Read aloud'}
        >
          {isSpeaking ? '⏸' : '🔊'}
        </button>
      </div>
      <div className="card p-5">
        <p className="text-[15px] text-text-secondary leading-relaxed">
          {summary}
        </p>
      </div>
    </div>
  );
}
