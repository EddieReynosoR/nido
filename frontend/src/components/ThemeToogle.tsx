import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { type Theme } from '@/types/utils.types';

const DARK_QUERY = '(prefers-color-scheme: dark)';

function getEffectiveTheme(): Theme {
  const root = document.documentElement;

  if (root.classList.contains('dark')) return 'dark';
  if (root.classList.contains('light')) return 'light';

  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
}

export default function ThemeToogle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(getEffectiveTheme());

    const mql = window.matchMedia(DARK_QUERY);
    const onChange = (e: MediaQueryListEvent) => {
      const root = document.documentElement;
      const hasOverride =
        root.classList.contains('dark') || root.classList.contains('light');

      if (!hasOverride) setTheme(e.matches ? 'dark' : 'light');
    };

    mql.addEventListener('change', onChange);

    return () => mql.removeEventListener('change', onChange);
  }, []);

  const toggle = () => {
    const next = getEffectiveTheme() === 'dark' ? 'light' : 'dark';
    const root = document.documentElement;

    root.classList.remove('dark', 'light');
    root.classList.add(next);
    setTheme(next);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label="Change theme"
    >
      {theme === 'dark' ? (
        <Sun className="size-5" />
      ) : (
        <Moon className="size-5" />
      )}
    </Button>
  );
}
