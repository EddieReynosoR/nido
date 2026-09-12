import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  useDndContext,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { Folder } from 'lucide-react';
import TopicTreeItem from '@/components/topics/TopicTreeItem';
import { SidebarMenu } from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import { useReparent } from '@/hooks/use-topic';
import { ROOT_DROPPABLE_ID, topicCollisionDetection } from '@/lib/topic-dnd';
import { cn } from '@/lib/utils';
import type { Topic, TopicDragData } from '@/types/topic.types';

type TopicTreeProps = {
  topics: Topic[];
  spaceId: string;
};

type TopicTreeRootProps = {
  topics: Topic[];
  openIds: Set<string>;
  onOpenChange: (topicId: string, open: boolean) => void;
};

// How long a topic has to be hovered during a drag before it expands on its own.
const AUTO_EXPAND_DELAY_MS = 600;

// A click never travels this far, so plain clicks keep toggling the collapsible instead of
// starting a drag. A delay constraint would instead make every click in the sidebar feel laggy.
const DRAG_ACTIVATION_DISTANCE = 6;

const withId = (ids: Set<string>, id: string) =>
  ids.has(id) ? ids : new Set(ids).add(id);

function TopicTreeRoot({ topics, openIds, onOpenChange }: TopicTreeRootProps) {
  const { active } = useDndContext();
  const dragged = active?.data.current as TopicDragData | undefined;

  // Dragging a topic that already sits at the root has nowhere to go here.
  const canDropOnRoot = !!dragged && dragged.parentId !== null;

  // Kept registered even when the drop is pointless, for the same reason as the topic rows:
  // unregistering a droppable mid-drag confuses dnd-kit's measurements.
  const { setNodeRef, isOver } = useDroppable({ id: ROOT_DROPPABLE_ID });

  const highlightRoot = isOver && canDropOnRoot;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'rounded-md',
        highlightRoot && 'bg-sidebar-accent/40 ring-2 ring-sidebar-ring/60'
      )}
    >
      <SidebarMenu>
        {topics.map((topic) => (
          <TopicTreeItem
            key={topic.topicId}
            topic={topic}
            openIds={openIds}
            onOpenChange={onOpenChange}
          />
        ))}
      </SidebarMenu>

      {canDropOnRoot ? (
        <div
          className={cn(
            'mt-1 rounded-md border border-dashed border-sidebar-border px-2 py-2 text-xs text-sidebar-foreground/50 select-none group-data-[collapsible=icon]:hidden',
            highlightRoot && 'border-sidebar-ring text-sidebar-foreground/80'
          )}
        >
          Move to top level
        </div>
      ) : null}
    </div>
  );
}

export default function TopicTree({ topics, spaceId }: TopicTreeProps) {
  const { accessToken } = useAuth();
  const { mutate: reparentTopic } = useReparent(accessToken);

  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [activeDrag, setActiveDrag] = useState<TopicDragData | null>(null);

  const expandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoveredIdRef = useRef<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE },
    }),
    useSensor(KeyboardSensor)
  );

  const clearExpandTimer = useCallback(() => {
    if (expandTimerRef.current) clearTimeout(expandTimerRef.current);
    expandTimerRef.current = null;
    hoveredIdRef.current = null;
  }, []);

  useEffect(() => clearExpandTimer, [clearExpandTimer]);

  const handleOpenChange = useCallback((topicId: string, open: boolean) => {
    setOpenIds((previous) => {
      if (previous.has(topicId) === open) return previous;

      const next = new Set(previous);
      if (open) next.add(topicId);
      else next.delete(topicId);

      return next;
    });
  }, []);

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveDrag(active.data.current as TopicDragData);
  };

  const handleDragOver = ({ over }: DragOverEvent) => {
    const hoveredId =
      over && over.id !== ROOT_DROPPABLE_ID ? String(over.id) : null;

    if (hoveredId === hoveredIdRef.current) return;

    if (expandTimerRef.current) clearTimeout(expandTimerRef.current);
    expandTimerRef.current = null;
    hoveredIdRef.current = hoveredId;

    if (!hoveredId) return;

    expandTimerRef.current = setTimeout(() => {
      setOpenIds((previous) => withId(previous, hoveredId));
    }, AUTO_EXPAND_DELAY_MS);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveDrag(null);
    clearExpandTimer();

    const dragged = active.data.current as TopicDragData | undefined;
    if (!over || !dragged) return;

    const newParentId = over.id === ROOT_DROPPABLE_ID ? null : String(over.id);

    // Every droppable stays registered, so these are the checks that actually enforce the bans
    // the rows only hint at by withholding their drop ring: a no-op move, a move onto itself,
    // and a move into its own subtree.
    if (newParentId === dragged.parentId) return;
    if (newParentId === dragged.topicId) return;
    if (newParentId && dragged.descendantIds.has(newParentId)) return;

    // Without this the topic lands inside a collapsed parent and looks like it vanished.
    if (newParentId) {
      setOpenIds((previous) => withId(previous, newParentId));
    }

    reparentTopic({ topicId: dragged.topicId, spaceId, newParentId });
  };

  const handleDragCancel = () => {
    setActiveDrag(null);
    clearExpandTimer();
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={topicCollisionDetection}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <TopicTreeRoot
        topics={topics}
        openIds={openIds}
        onOpenChange={handleOpenChange}
      />

      <DragOverlay dropAnimation={null}>
        {activeDrag ? (
          <div className="pointer-events-none flex items-center gap-2 rounded-md bg-sidebar px-2 py-1.5 text-sm text-sidebar-foreground shadow-md ring-1 ring-sidebar-border select-none">
            <Folder className="size-4 text-sidebar-foreground/50" />
            <span className="truncate">{activeDrag.name}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
