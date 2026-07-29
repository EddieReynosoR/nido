import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { type Theme } from '@/types/utils.types';

function getEffectiveTheme(): Theme {
  const root = document.documentElement;

  if (root.classList.contains('dark')) return 'dark';
  if (root.classList.contains('light')) return 'light';

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export default function ThemeToogle() {
  const [theme, setTheme] = useState<Theme>(getEffectiveTheme());

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
      aria-label="Cambiar tema"
    >
      {theme === 'dark' ? (
        <Sun className="size-5" />
      ) : (
        <Moon className="=size-5" />
      )}
    </Button>
  );
}
