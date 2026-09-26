import { useSyncExternalStore } from 'react';
import { DARK_QUERY, getEffectiveTheme } from '@/lib/theme';
import { type Theme } from '@/types/utils.types';

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });

  const mql = window.matchMedia(DARK_QUERY);
  mql.addEventListener('change', onChange);

  return () => {
    observer.disconnect();
    mql.removeEventListener('change', onChange);
  };
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getEffectiveTheme);
}
