import type { Topic, TopicDragData } from '@/types/topic.types';

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

/**
 * Moves `topicId` under `newParentId` (or to the root when it is `null`), returning a new tree.
 * The input is returned untouched when either end of the move cannot be found, so a stale cache
 * is never corrupted. Siblings are sorted by name to match the backend's `ORDER BY t.name ASC`,
 * which keeps the optimistic tree from jumping once the refetch lands.
 */
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

/**
 * Whether `dragged` may be dropped on `targetId`, where `null` is the root drop zone. The single
 * source of truth for drop legality: droppables use it in `accept` and `onDragEnd` re-runs it.
 * Rejects a drop on the topic itself, on one of its descendants (which would detach the subtree)
 * and on the parent it already has — including a root topic dropped back on the root.
 */
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
