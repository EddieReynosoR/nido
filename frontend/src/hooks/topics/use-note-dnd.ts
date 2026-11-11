import { useDraggable } from '@dnd-kit/react';
import {
  useCallback,
  useEffect,
  useRef,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { cn } from '@/lib/utils';

import { useSidebar } from '@/components/ui/sidebar';
import type { NoteDragData, NoteTreeItem } from '@/types/note.types';

export function useNoteDnd(note: NoteTreeItem) {
  const { state, isMobile } = useSidebar();
  const dragDisabled = state === 'collapsed' && !isMobile;

  const {
    ref: rowRef,
    handleRef,
    isDragging,
    isDragSource,
  } = useDraggable<NoteDragData>({
    id: note.noteId,
    disabled: dragDisabled,
    data: {
      kind: 'note',
      noteId: note.noteId,
      topicId: note.topicId,
      title: note.title,
    },
  });

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
      ref: rowRef,
      onPointerDownCapture,
      onClickCapture,
      className: cn(isDragSource && 'opacity-40'),
    },
    handleProps: { ref: handleRef },
  };
}
