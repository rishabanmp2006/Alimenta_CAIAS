<<<<<<< HEAD
import { useState, useEffect, useCallback, useRef } from 'react';
=======
import { useState, useEffect, useCallback } from 'react';
>>>>>>> 2ea5df27c0c9c7857aec00775ea20ff2e279ab33

const STORAGE_KEY = 'eatiq_scan_history';
const MAX_HISTORY = 50;

/**
 * Custom hook for managing scan history in localStorage
 */
export function useHistory() {
  const [history, setHistory] = useState([]);
<<<<<<< HEAD
  const isInitialized = useRef(false);

  // Load history from localStorage on mount
  useEffect(() => {
    if (isInitialized.current) return;
    
=======

  // Load history from localStorage on mount
  useEffect(() => {
>>>>>>> 2ea5df27c0c9c7857aec00775ea20ff2e279ab33
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
<<<<<<< HEAD
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
=======
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
>>>>>>> 2ea5df27c0c9c7857aec00775ea20ff2e279ab33

  return { history, addToHistory, removeFromHistory, clearHistory };
}
