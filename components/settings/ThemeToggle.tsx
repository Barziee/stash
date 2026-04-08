'use client';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-card border border-border hover:bg-accent transition-colors"
    >
      {theme === 'dark' ? <Moon size={18} className="text-primary" /> : <Sun size={18} className="text-amber-500" />}
      <div className="flex-1 text-start">
        <p className="text-sm font-medium text-foreground">
          {theme === 'dark' ? 'מצב כהה' : 'מצב בהיר'}
        </p>
        <p className="text-xs text-muted-foreground">
          לחץ להחלפה ל{theme === 'dark' ? 'בהיר' : 'כהה'}
        </p>
      </div>
      <div className={`w-11 h-6 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-muted-foreground'}`}>
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${theme === 'dark' ? 'start-5' : 'start-0.5'}`} />
      </div>
    </button>
  );
}
