import type { NoteTreeItem } from '@/types/note.types';
import type { SpaceContent } from '@/types/space.types';
import type { DragData, Topic, TopicDragData } from '@/types/topic.types';

const byName = (a: Topic, b: Topic) => a.name.localeCompare(b.name);

export function collectDescendantIds(topic: Topic): Set<string> {
  const ids = new Set<string>();

  const walk = (nodes: Topic[]) => {
    for (const node of nodes) {
      ids.add(node.topicId);
      walk(node.topics);
    }
  };

  walk(topic.topics);

  return ids;
}

export function findTopicInTree(
  topics: Topic[],
  topicId: string
): Topic | null {
  for (const topic of topics) {
    if (topic.topicId === topicId) return topic;

    const found = findTopicInTree(topic.topics, topicId);
    if (found) return found;
  }

  return null;
}

export function findTopicPath(
  topics: Topic[],
  topicId: string
): string[] | null {
  for (const topic of topics) {
    if (topic.topicId === topicId) return [topic.topicId];

    const path = findTopicPath(topic.topics, topicId);
    if (path) return [topic.topicId, ...path];
  }

  return null;
}

type DetachResult = { topics: Topic[]; removed: Topic | null };

function detach(topics: Topic[], topicId: string): DetachResult {
  let removed: Topic | null = null;
  const next: Topic[] = [];

  for (const topic of topics) {
    if (topic.topicId === topicId) {
      removed = topic;
      continue;
    }

    const result = detach(topic.topics, topicId);

    if (result.removed) {
      removed = result.removed;
      next.push({ ...topic, topics: result.topics });
    } else {
      next.push(topic);
    }
  }

  return { topics: next, removed };
}

type AttachResult = { topics: Topic[]; attached: boolean };

function attach(topics: Topic[], parentId: string, node: Topic): AttachResult {
  let attached = false;
  const next: Topic[] = [];

  for (const topic of topics) {
    if (topic.topicId === parentId) {
      attached = true;
      next.push({ ...topic, topics: [...topic.topics, node].sort(byName) });
      continue;
    }

    const result = attach(topic.topics, parentId, node);

    if (result.attached) {
      attached = true;
      next.push({ ...topic, topics: result.topics });
    } else {
      next.push(topic);
    }
  }

  return { topics: next, attached };
}

export function moveTopicInTree(
  topics: Topic[],
  topicId: string,
  newParentId: string | null
): Topic[] {
  const { topics: detached, removed } = detach(topics, topicId);
  if (!removed) return topics;

  const moved: Topic = { ...removed, parentId: newParentId };

  if (newParentId === null) {
    return [...detached, moved].sort(byName);
  }

  const { topics: result, attached } = attach(detached, newParentId, moved);

  return attached ? result : topics;
}

export function removeTopicFromTree(topics: Topic[], topicId: string): Topic[] {
  const { topics: next, removed } = detach(topics, topicId);

  return removed ? next : topics;
}

export function insertTopicInTree(
  topics: Topic[],
  node: Topic,
  parentId: string | null
): Topic[] {
  if (parentId === null) return [...topics, node].sort(byName);

  const { topics: result, attached } = attach(topics, parentId, node);

  return attached ? result : topics;
}

type UpdateResult = { topics: Topic[]; updated: boolean };

function applyUpdate(
  topics: Topic[],
  topicId: string,
  changes: Pick<Topic, 'name' | 'color'>
): UpdateResult {
  let updated = false;
  let needsSort = false;
  const next: Topic[] = [];

  for (const topic of topics) {
    if (topic.topicId === topicId) {
      updated = true;
      needsSort = topic.name !== changes.name;
      next.push({ ...topic, ...changes });
      continue;
    }

    const result = applyUpdate(topic.topics, topicId, changes);

    if (result.updated) {
      updated = true;
      next.push({ ...topic, topics: result.topics });
    } else {
      next.push(topic);
    }
  }

  return { topics: needsSort ? next.sort(byName) : next, updated };
}

export function updateTopicInTree(
  topics: Topic[],
  topicId: string,
  changes: Pick<Topic, 'name' | 'color'>
): Topic[] {
  const { topics: result, updated } = applyUpdate(topics, topicId, changes);

  return updated ? result : topics;
}

function applyNoteId(
  topics: Topic[],
  topicId: string,
  noteId: string | null
): UpdateResult {
  let updated = false;
  const next: Topic[] = [];

  for (const topic of topics) {
    if (topic.topicId === topicId) {
      updated = true;
      next.push({ ...topic, noteId });
      continue;
    }

    const result = applyNoteId(topic.topics, topicId, noteId);

    if (result.updated) {
      updated = true;
      next.push({ ...topic, topics: result.topics });
    } else {
      next.push(topic);
    }
  }

  return { topics: next, updated };
}

export function setTopicNoteId(
  topics: Topic[],
  topicId: string,
  noteId: string | null
): Topic[] {
  const { topics: result, updated } = applyNoteId(topics, topicId, noteId);

  return updated ? result : topics;
}

export function canDropTopic(
  dragged: TopicDragData,
  targetId: string | null
): boolean {
  return (
    targetId !== dragged.parentId &&
    targetId !== dragged.topicId &&
    !(targetId !== null && dragged.descendantIds.has(targetId))
  );
}

export function canDrop(dragged: DragData, targetId: string | null): boolean {
  return dragged.kind === 'note'
    ? targetId !== dragged.topicId
    : canDropTopic(dragged, targetId);
}

export function mapTopicsInContent(
  content: SpaceContent | null | undefined,
  update: (topics: Topic[]) => Topic[]
): SpaceContent | null | undefined {
  if (!content) return content;

  const topics = update(content.topics);

  return topics === content.topics ? content : { ...content, topics };
}

export function insertRootNoteSorted(
  content: SpaceContent | null | undefined,
  note: NoteTreeItem
): SpaceContent | null | undefined {
  if (!content) return content;

  const notes = content.notes
    .filter((n) => n.noteId !== note.noteId)
    .concat(note)
    .sort((a, b) => a.title.localeCompare(b.title));

  return { ...content, notes };
}

function applyNoteInsert(
  topics: Topic[],
  topicId: string,
  note: NoteTreeItem
): UpdateResult {
  let updated = false;
  const next: Topic[] = [];

  for (const topic of topics) {
    if (topic.topicId === topicId) {
      updated = true;
      const notes = topic.notes
        .filter((n) => n.noteId !== note.noteId)
        .concat(note)
        .sort((a, b) => a.title.localeCompare(b.title));
      next.push({ ...topic, notes });
      continue;
    }

    const result = applyNoteInsert(topic.topics, topicId, note);

    if (result.updated) {
      updated = true;
      next.push({ ...topic, topics: result.topics });
    } else {
      next.push(topic);
    }
  }

  return { topics: next, updated };
}

export function insertTopicNoteSorted(
  content: SpaceContent | null | undefined,
  topicId: string,
  note: NoteTreeItem
): SpaceContent | null | undefined {
  return mapTopicsInContent(content, (topics) => {
    const { topics: result, updated } = applyNoteInsert(topics, topicId, note);

    return updated ? result : topics;
  });
}

function applyNoteChanges(
  topics: Topic[],
  topicId: string,
  noteId: string,
  changes: Partial<NoteTreeItem>
): UpdateResult {
  let updated = false;
  const next: Topic[] = [];

  for (const topic of topics) {
    if (topic.topicId === topicId) {
      updated = true;
      next.push({
        ...topic,
        notes: topic.notes.map((note) =>
          note.noteId === noteId ? { ...note, ...changes } : note
        ),
      });
      continue;
    }

    const result = applyNoteChanges(topic.topics, topicId, noteId, changes);

    if (result.updated) {
      updated = true;
      next.push({ ...topic, topics: result.topics });
    } else {
      next.push(topic);
    }
  }

  return { topics: next, updated };
}

export function updateNoteInContent(
  content: SpaceContent | null | undefined,
  noteId: string,
  topicId: string | null,
  changes: Partial<NoteTreeItem>
): SpaceContent | null | undefined {
  if (!content) return content;

  if (!topicId) {
    return {
      ...content,
      notes: content.notes.map((note) =>
        note.noteId === noteId ? { ...note, ...changes } : note
      ),
    };
  }

  return mapTopicsInContent(content, (topics) => {
    const { topics: result, updated } = applyNoteChanges(
      topics,
      topicId,
      noteId,
      changes
    );

    return updated ? result : topics;
  });
}

function applyNoteRemove(
  topics: Topic[],
  topicId: string,
  noteId: string
): UpdateResult {
  let updated = false;
  const next: Topic[] = [];

  for (const topic of topics) {
    if (topic.topicId === topicId) {
      updated = true;
      next.push({
        ...topic,
        notes: topic.notes.filter((note) => note.noteId !== noteId),
      });
      continue;
    }

    const result = applyNoteRemove(topic.topics, topicId, noteId);

    if (result.updated) {
      updated = true;
      next.push({ ...topic, topics: result.topics });
    } else {
      next.push(topic);
    }
  }

  return { topics: next, updated };
}

export function removeNoteFromContent(
  content: SpaceContent | null | undefined,
  noteId: string,
  topicId: string | null
): SpaceContent | null | undefined {
  if (!content) return content;

  if (!topicId) {
    return {
      ...content,
      notes: content.notes.filter((note) => note.noteId !== noteId),
    };
  }

  return mapTopicsInContent(content, (topics) => {
    const { topics: result, updated } = applyNoteRemove(
      topics,
      topicId,
      noteId
    );

    return updated ? result : topics;
  });
}

export function findNoteTopicPath(
  topics: Topic[],
  noteId: string
): string[] | null {
  for (const topic of topics) {
    if (topic.notes.some((note) => note.noteId === noteId)) {
      return [topic.topicId];
    }

    const path = findNoteTopicPath(topic.topics, noteId);
    if (path) return [topic.topicId, ...path];
  }

  return null;
}

function findNoteInTopics(
  topics: Topic[],
  noteId: string
): NoteTreeItem | null {
  for (const topic of topics) {
    const note = topic.notes.find((item) => item.noteId === noteId);
    if (note) return note;

    const found = findNoteInTopics(topic.topics, noteId);
    if (found) return found;
  }

  return null;
}

export function findNoteInContent(
  content: SpaceContent,
  noteId: string
): NoteTreeItem | null {
  return (
    content.notes.find((note) => note.noteId === noteId) ??
    findNoteInTopics(content.topics, noteId)
  );
}
