const queues = new Map<string, Promise<unknown>>();

export function enqueueNoteSave<T>(
  noteId: string,
  task: () => Promise<T>
): Promise<T> {
  const previous = queues.get(noteId) ?? Promise.resolve();
  const result = previous.then(task);

  const tail = result.catch(() => {});
  queues.set(noteId, tail);
  tail.then(() => {
    if (queues.get(noteId) === tail) queues.delete(noteId);
  });

  return result;
}

const discarded = new Set<string>();

export function discardNoteSaves(noteId: string) {
  discarded.add(noteId);
}

export function restoreNoteSaves(noteId: string) {
  discarded.delete(noteId);
}

export function isNoteDiscarded(noteId: string) {
  return discarded.has(noteId);
}
