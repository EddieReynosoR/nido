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
