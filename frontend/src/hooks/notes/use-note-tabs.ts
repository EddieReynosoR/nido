import { useCallback, useState } from 'react';
import { readNoteTabs, writeNoteTabs } from '@/lib/note-tabs';

export function useNoteTabs(spaceId: string | undefined) {
  const [state, setState] = useState(() => ({
    spaceId,
    ids: spaceId ? readNoteTabs(spaceId) : [],
  }));

  if (state.spaceId !== spaceId) {
    setState({ spaceId, ids: spaceId ? readNoteTabs(spaceId) : [] });
  }

  const updateTabs = useCallback(
    (update: (ids: string[]) => string[]) => {
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
    (topicId: string) =>
      updateTabs((ids) => (ids.includes(topicId) ? ids : [...ids, topicId])),
    [updateTabs]
  );

  const closeTab = useCallback(
    (topicId: string) => {
      const index = state.ids.indexOf(topicId);
      updateTabs((ids) => ids.filter((id) => id !== topicId));

      if (index === -1) return null;
      return state.ids[index + 1] ?? state.ids[index - 1] ?? null;
    },
    [state.ids, updateTabs]
  );

  const retainTabs = useCallback(
    (isValid: (topicId: string) => boolean) =>
      updateTabs((ids) =>
        ids.every(isValid) ? ids : ids.filter((id) => isValid(id))
      ),
    [updateTabs]
  );

  return { tabs: state.ids, openTab, closeTab, retainTabs };
}
