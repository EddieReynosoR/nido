import { type Theme } from '@/types/utils.types';

export const DARK_QUERY = '(prefers-color-scheme: dark)';

export function getEffectiveTheme(): Theme {
  const root = document.documentElement;

  if (root.classList.contains('dark')) return 'dark';
  if (root.classList.contains('light')) return 'light';

  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
}

export function toggleTheme(): Theme {
  const next = getEffectiveTheme() === 'dark' ? 'light' : 'dark';
  const root = document.documentElement;

  root.classList.remove('dark', 'light');
  root.classList.add(next);

  return next;
}
