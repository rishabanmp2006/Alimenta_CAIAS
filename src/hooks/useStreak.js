/**
 * Daily scan streak tracker
 * Tracks consecutive days the user has scanned a product
 */
import { useState, useEffect } from 'react';

const KEY = 'alimenta_streak';

export function useStreak() {
  const [streak, setStreak] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || { current: 0, best: 0, lastDate: null, totalScans: 0 };
    } catch { return { current: 0, best: 0, lastDate: null, totalScans: 0 }; }
  });

  const recordScan = () => {
    const today = new Date().toDateString();
    setStreak(prev => {
      if (prev.lastDate === today) {
        // Already scanned today — just increment totalScans
        const updated = { ...prev, totalScans: prev.totalScans + 1 };
        localStorage.setItem(KEY, JSON.stringify(updated));
        return updated;
      }

      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newCurrent = prev.lastDate === yesterday ? prev.current + 1 : 1;
      const updated = {
        current: newCurrent,
        best: Math.max(newCurrent, prev.best),
        lastDate: today,
        totalScans: prev.totalScans + 1,
      };
      localStorage.setItem(KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return { streak, recordScan };
}
