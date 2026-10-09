import { useDraggable, useDroppable } from '@dnd-kit/react';
import { CollisionPriority } from '@dnd-kit/abstract';
import {
  useMemo,
  useCallback,
  useEffect,
  useRef,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { cn } from '@/lib/utils';

import { canDropTopic, collectDescendantIds } from '@/lib/topic-tree';
import { useSidebar } from '@/components/ui/sidebar';
import type {
  Topic,
  TopicTreeItemProps,
  TopicDragData,
} from '@/types/topic.types';
import { AUTO_EXPAND_DELAY_MS } from '@/constants/const';

export function useTopicDnd(
  topic: Topic,
  onOpenChange: TopicTreeItemProps['onOpenChange']
) {
  const { state, isMobile } = useSidebar();
  const dragDisabled = state === 'collapsed' && !isMobile;

  const descendantIds = useMemo(() => collectDescendantIds(topic), [topic]);

  const {
    ref: dragRef,
    handleRef,
    isDragging,
    isDragSource,
  } = useDraggable<TopicDragData>({
    id: topic.topicId,
    disabled: dragDisabled,
    data: {
      topicId: topic.topicId,
      parentId: topic.parentId,
      name: topic.name,
      descendantIds,
    },
  });

  const { ref: dropRef, isDropTarget } = useDroppable({
    id: topic.topicId,
    collisionPriority: CollisionPriority.Normal,
    accept: (source) =>
      canDropTopic(source.data as TopicDragData, topic.topicId),
  });

  const setRowRef = useCallback(
    (node: HTMLDivElement | null) => {
      dragRef(node);
      dropRef(node);
    },
    [dragRef, dropRef]
  );

  const hasChildren = topic.topics.length > 0;

  useEffect(() => {
    if (!isDropTarget || !hasChildren) return;

    const timer = setTimeout(
      () => onOpenChange(topic.topicId, true),
      AUTO_EXPAND_DELAY_MS
    );

    return () => clearTimeout(timer);
  }, [isDropTarget, hasChildren, onOpenChange, topic.topicId]);

  const draggedRef = useRef(false);

  useEffect(() => {
    if (isDragging) draggedRef.current = true;
  }, [isDragging]);

  const onPointerDownCapture = useCallback(() => {
    draggedRef.current = false;
  }, []);

  const onClickCapture = useCallback((event: ReactMouseEvent) => {
    if (!draggedRef.current) return;

    draggedRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  }, []);

  return {
    rowProps: {
      ref: setRowRef,
      onPointerDownCapture,
      onClickCapture,
      className: cn(
        'relative rounded-md',
        isDragSource && 'opacity-40',
        isDropTarget && 'bg-sidebar-accent ring-2 ring-sidebar-ring'
      ),
    },
    handleProps: { ref: handleRef },
  };
}
