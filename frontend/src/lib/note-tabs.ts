import type { NoteTab } from '@/types/note.types';

const noteTabsKey = (spaceId: string) => `nido:openTabs:${spaceId}`;

export const isSameTab = (a: NoteTab, b: NoteTab) =>
  a.type === b.type && a.id === b.id;

export const tabPath = (tab: NoteTab) =>
  tab.type === 'topic' ? `/topics/${tab.id}` : `/notes/${tab.id}`;

function isNoteTab(value: unknown): value is NoteTab {
  if (typeof value !== 'object' || value === null) return false;

  const { type, id } = value as Record<string, unknown>;
  return (type === 'topic' || type === 'note') && typeof id === 'string';
}

// Entries saved in the old format (plain topic ids) are dropped.
export function readNoteTabs(spaceId: string): NoteTab[] {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem(noteTabsKey(spaceId)) ?? '[]'
    );

    return Array.isArray(value) ? value.filter(isNoteTab) : [];
  } catch {
    return [];
  }
}

export function writeNoteTabs(spaceId: string, tabs: NoteTab[]) {
  try {
    localStorage.setItem(noteTabsKey(spaceId), JSON.stringify(tabs));
  } catch {}
}
