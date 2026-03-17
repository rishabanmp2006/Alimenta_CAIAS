import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'eatiq_scan_history';
const MAX_HISTORY = 50;

/**
 * Custom hook for managing scan history in localStorage
 */
export function useHistory() {
  const [history, setHistory] = useState([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  }, []);

  // Save to localStorage whenever history changes
  const saveHistory = useCallback((newHistory) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (e) {
      console.error('Failed to save history:', e);
    }
  }, []);

  const addToHistory = useCallback((product) => {
    const entry = {
      ...product,
      scannedAt: new Date().toISOString()
    };
    
    // Remove duplicate if exists
    const filtered = history.filter(h => h.id !== product.id);
    const newHistory = [entry, ...filtered].slice(0, MAX_HISTORY);
    saveHistory(newHistory);
  }, [history, saveHistory]);

  const removeFromHistory = useCallback((productId) => {
    const newHistory = history.filter(h => h.id !== productId);
    saveHistory(newHistory);
  }, [history, saveHistory]);

  const clearHistory = useCallback(() => {
    saveHistory([]);
  }, [saveHistory]);

  return { history, addToHistory, removeFromHistory, clearHistory };
}
