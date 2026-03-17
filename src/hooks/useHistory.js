import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'eatiq_scan_history';
const MAX_HISTORY = 50;

/**
 * Custom hook for managing scan history in localStorage
 */
export function useHistory() {
  const [history, setHistory] = useState([]);
  const isInitialized = useRef(false);

  // Load history from localStorage on mount
  useEffect(() => {
    if (isInitialized.current) return;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
      isInitialized.current = true;
    } catch (e) {
      console.error('Failed to load history:', e);
      isInitialized.current = true;
    }
  }, []);

  // Save to localStorage whenever history changes (but skip on initial load)
  useEffect(() => {
    if (!isInitialized.current) return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save history:', e);
    }
  }, [history]);

  const addToHistory = useCallback((product) => {
    setHistory(currentHistory => {
      const entry = {
        ...product,
        scannedAt: new Date().toISOString()
      };
      
      // Remove duplicate if exists
      const filtered = currentHistory.filter(h => h.id !== product.id);
      return [entry, ...filtered].slice(0, MAX_HISTORY);
    });
  }, []);

  const removeFromHistory = useCallback((productId) => {
    setHistory(currentHistory => currentHistory.filter(h => h.id !== productId));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return { history, addToHistory, removeFromHistory, clearHistory };
}
