import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { type Theme } from '@/types/utils.types';
import { DARK_QUERY, getEffectiveTheme, toggleTheme } from '@/lib/theme';

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
    setTheme(toggleTheme());
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
