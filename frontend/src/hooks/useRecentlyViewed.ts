import { useState, useCallback } from "react";

const STORAGE_KEY = "recentlyViewedProducts";

export const useRecentlyViewed = () => {
  const [recentIds, setRecentIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // useCallback keeps this function's identity stable across renders.
  // Previously a new function was created every render, and since
  // ProductDetail's effect lists this function in its dependency array,
  // the effect re-fired every single render — calling setRecentIds with
  // a brand-new array each time, which triggered another render, forever
  // (React error #185 — max update depth exceeded).
  const addToRecentlyViewed = useCallback((productId: string) => {
    setRecentIds((prev) => {
      // Nothing actually changed — bail out with the same reference
      // so React can skip re-rendering entirely.
      if (prev[0] === productId) return prev;
      const filtered = prev.filter((id) => id !== productId);
      const updated = [productId, ...filtered].slice(0, 8);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { recentIds, addToRecentlyViewed };
};