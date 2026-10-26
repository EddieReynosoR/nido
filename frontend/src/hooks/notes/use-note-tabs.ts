import { createContext, useContext } from 'react';
import type { NoteTab } from '@/types/note.types';

export type NoteTabsContextType = {
  tabs: NoteTab[];
  openTab: (tab: NoteTab) => void;
  closeTab: (tab: NoteTab) => NoteTab | null;
  retainTabs: (isValid: (tab: NoteTab) => boolean) => void;
};

export const NoteTabsContext = createContext<NoteTabsContextType | null>(null);

export function useNoteTabs() {
  const context = useContext(NoteTabsContext);

  if (!context) {
    throw new Error('useNoteTabs must be used within a NoteTabsProvider');
  }

  return context;
}
