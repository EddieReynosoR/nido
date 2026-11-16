import { useDraggable } from '@dnd-kit/react';
import { cn } from '@/lib/utils';

import { useSuppressClickAfterDrag } from '@/hooks/use-suppress-click-after-drag';
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

  const suppressClickProps = useSuppressClickAfterDrag(isDragging);

  return {
    rowProps: {
      ref: rowRef,
      ...suppressClickProps,
      className: cn(isDragSource && 'opacity-40'),
    },
    handleProps: { ref: handleRef },
  };
}
