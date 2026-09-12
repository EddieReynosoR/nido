import { pointerWithin, type CollisionDetection } from '@dnd-kit/core';

export const ROOT_DROPPABLE_ID = 'topic-root-dropzone';

/**
 * Topic droppables are row-sized and never overlap, so `pointerWithin` resolves them exactly.
 * The root drop zone is the exception: it encloses every row, so it only wins when the pointer
 * is over no topic at all. A drop over nothing stays a no-op — no `closestCenter` fallback,
 * which would otherwise snap to the nearest row from anywhere in the sidebar.
 */
export const topicCollisionDetection: CollisionDetection = (args) => {
  const collisions = pointerWithin(args);
  const topicCollisions = collisions.filter(
    (collision) => collision.id !== ROOT_DROPPABLE_ID
  );

  return topicCollisions.length
    ? topicCollisions
    : collisions.filter((collision) => collision.id === ROOT_DROPPABLE_ID);
};
