const noteTabsKey = (spaceId: string) => `nido:openTabs:${spaceId}`;

export function readNoteTabs(spaceId: string): string[] {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem(noteTabsKey(spaceId)) ?? '[]'
    );

    return Array.isArray(value)
      ? value.filter((id): id is string => typeof id === 'string')
      : [];
  } catch {
    return [];
  }
}

export function writeNoteTabs(spaceId: string, ids: string[]) {
  try {
    localStorage.setItem(noteTabsKey(spaceId), JSON.stringify(ids));
  } catch {}
}
