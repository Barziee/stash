'use client';
import { useState, useEffect, useCallback } from 'react';

type Theme = 'dark' | 'light';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    const stored = localStorage.getItem('stash-theme') as Theme | null;
    const initial = stored || 'dark';
    setThemeState(initial);
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(initial);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem('stash-theme', t);
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(t);
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return { theme, setTheme, toggle };
}
