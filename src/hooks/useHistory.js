import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'alimenta_scan_history';
const MAX_HISTORY = 50;

/**
 * Custom hook for managing scan history in localStorage
 */
export function useHistory() {
  const [history, setHistory] = useState(() => {
    // Initialize state directly from localStorage (runs once, synchronously)
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to load history:', e);
      return [];
    }
  });

  // Persist to localStorage whenever history changes
  useEffect(() => {
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
