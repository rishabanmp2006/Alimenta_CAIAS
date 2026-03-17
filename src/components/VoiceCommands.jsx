import { useState, useEffect, useRef } from 'react';

export default function VoiceCommands({ onCommand }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check if browser supports Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);

        // If result is final, process the command
        if (event.results[current].isFinal) {
          processCommand(transcriptText);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const processCommand = (text) => {
    const lowerText = text.toLowerCase();
    
    // Command patterns
    if (lowerText.includes('search for') || lowerText.includes('find')) {
      const product = text.replace(/search for|find/gi, '').trim();
      onCommand({ type: 'search', query: product });
    } else if (lowerText.includes('scan') || lowerText.includes('analyze')) {
      const product = text.replace(/scan|analyze/gi, '').trim();
      onCommand({ type: 'search', query: product });
    } else if (lowerText.includes('compare')) {
      onCommand({ type: 'navigate', path: '/compare' });
    } else if (lowerText.includes('history')) {
      onCommand({ type: 'navigate', path: '/history' });
    } else if (lowerText.includes('home') || lowerText.includes('back')) {
      onCommand({ type: 'navigate', path: '/' });
    } else {
      // Default: treat as search query
      onCommand({ type: 'search', query: text });
    }

    setTranscript('');
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  if (!supported) {
    return null; // Don't show if browser doesn't support it
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Voice Button */}
      <button
        onClick={toggleListening}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl transition-all duration-300 ${
          isListening
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-accent text-white hover:bg-blue-600 hover:scale-110'
        }`}
        title="Voice Commands"
      >
        {isListening ? '🔴' : '🎤'}
      </button>

      {/* Transcript Display */}
      {(isListening || transcript) && (
        <div className="absolute bottom-16 right-0 mb-2 animate-fade-in-up">
          <div className="card p-4 max-w-xs shadow-xl">
            <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wide mb-1">
              {isListening ? 'Listening...' : 'Heard:'}
            </p>
            <p className="text-[13px] text-text-primary">
              {transcript || 'Say a command...'}
            </p>
            <div className="mt-2 pt-2 border-t border-border-light">
              <p className="text-[10px] text-text-tertiary">Try: "Search for Coca-Cola" or "Compare products"</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
