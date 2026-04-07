'use client';
import { useState, useCallback } from 'react';

const STORAGE_KEY = 'privacy_mode';

export function usePrivacyMode(): [boolean, () => void] {
  const [hidden, setHidden] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  const toggle = useCallback(() => {
    setHidden(prev => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  return [hidden, toggle];
}
