'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

// Тумблер темы: стампует data-theme на <html>, сохраняет в localStorage.
// Инлайн-скрипт в layout выставляет тему до гидрации (без FOUC).
export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);

  useEffect(() => {
    const stored = document.documentElement.getAttribute('data-theme') as
      | 'light'
      | 'dark'
      | null;
    setTheme(stored ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  }, []);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    setTheme(next);
  }

  return (
    <button
      onClick={toggle}
      aria-label="Переключить тему"
      className="grid h-9 w-9 place-items-center rounded-lg border border-hair/30 text-ink-soft transition-colors hover:text-ink hover:border-accent/50"
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
