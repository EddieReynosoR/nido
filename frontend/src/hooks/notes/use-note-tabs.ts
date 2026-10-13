import { createContext, useContext } from 'react';

export type NoteTabsContextType = {
  tabs: string[];
  openTab: (topicId: string) => void;
  closeTab: (topicId: string) => string | null;
  retainTabs: (isValid: (topicId: string) => boolean) => void;
};

export const NoteTabsContext = createContext<NoteTabsContextType | null>(null);

export function useNoteTabs() {
  const context = useContext(NoteTabsContext);

  if (!context) {
    throw new Error('useNoteTabs must be used within a NoteTabsProvider');
  }

  return context;
}
