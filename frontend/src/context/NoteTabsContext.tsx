import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { NoteTabsContext } from '@/hooks/notes/use-note-tabs';
import { isSameTab, readNoteTabs, writeNoteTabs } from '@/lib/note-tabs';
import type { NoteTab } from '@/types/note.types';

export function NoteTabsProvider({
  spaceId,
  children,
}: {
  spaceId: string | undefined;
  children: ReactNode;
}) {
  const [state, setState] = useState(() => ({
    spaceId,
    ids: spaceId ? readNoteTabs(spaceId) : [],
  }));

  if (state.spaceId !== spaceId) {
    setState({ spaceId, ids: spaceId ? readNoteTabs(spaceId) : [] });
  }

  const updateTabs = useCallback(
    (update: (ids: NoteTab[]) => NoteTab[]) => {
      if (!spaceId) return;

      setState((previous) => {
        const ids = update(previous.ids);
        if (ids === previous.ids) return previous;

        writeNoteTabs(spaceId, ids);
        return { spaceId, ids };
      });
    },
    [spaceId]
  );

  const openTab = useCallback(
    (tab: NoteTab) =>
      updateTabs((ids) =>
        ids.some((item) => isSameTab(item, tab)) ? ids : [...ids, tab]
      ),
    [updateTabs]
  );

  const closeTab = useCallback(
    (tab: NoteTab) => {
      const index = state.ids.findIndex((item) => isSameTab(item, tab));
      updateTabs((ids) => ids.filter((item) => !isSameTab(item, tab)));

      if (index === -1) return null;
      return state.ids[index + 1] ?? state.ids[index - 1] ?? null;
    },
    [state.ids, updateTabs]
  );

  const retainTabs = useCallback(
    (isValid: (tab: NoteTab) => boolean) =>
      updateTabs((ids) =>
        ids.every(isValid) ? ids : ids.filter((id) => isValid(id))
      ),
    [updateTabs]
  );

  const value = useMemo(
    () => ({ tabs: state.ids, openTab, closeTab, retainTabs }),
    [state.ids, openTab, closeTab, retainTabs]
  );

  return <NoteTabsContext value={value}>{children}</NoteTabsContext>;
}
