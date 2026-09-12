import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { ChevronRight, Folder } from 'lucide-react';
import { useDndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { collectDescendantIds } from '@/lib/topic-tree';
import { cn } from '@/lib/utils';
import type { Topic, TopicDragData, TopicDropData } from '@/types/topic.types';

type TopicTreeItemProps = {
  topic: Topic;
  openIds: Set<string>;
  onOpenChange: (topicId: string, open: boolean) => void;
};

const rotateChevronWhenOpen = '[&[data-state=open]>svg:last-child]:rotate-90';

const grabCursor = 'cursor-grab active:cursor-grabbing';

function TopicLabel({ topic }: { topic: Topic }) {
  return (
    <>
      <Folder className="text-sidebar-foreground/50" />
      <span className="truncate select-none">{topic.name}</span>
    </>
  );
}

function TopicChevron() {
  return (
    <ChevronRight className="ml-auto text-sidebar-foreground/40 transition-transform" />
  );
}

/**
 * Wires one topic row into the surrounding `DndContext`.
 *
 * The droppable and draggable node both live on a wrapper around the row button rather than on
 * the `<li>`: the `<li>` also holds the collapsible content, so its rect would enclose every
 * descendant row and make the parent unhittable. The wrapper also carries the drop ring, which
 * the button itself would clip (`sidebarMenuButtonVariants` sets `overflow-hidden`).
 */
function useTopicDnd(topic: Topic) {
  const { state, isMobile } = useSidebar();
  const dragDisabled = state === 'collapsed' && !isMobile;

  const descendantIds = useMemo(() => collectDescendantIds(topic), [topic]);

  const {
    attributes,
    listeners,
    setNodeRef: setDragNodeRef,
    setActivatorNodeRef,
    isDragging,
  } = useDraggable({
    id: topic.topicId,
    disabled: dragDisabled,
    data: {
      topicId: topic.topicId,
      parentId: topic.parentId,
      name: topic.name,
      descendantIds,
    } satisfies TopicDragData,
  });

  const { active } = useDndContext();
  const dragged = active?.data.current as TopicDragData | undefined;

  // Dropping a topic on itself, on one of its own descendants (which would detach the subtree)
  // or back on the parent it already has. The droppable stays registered either way — disabling
  // it would unregister it mid-drag and leave dnd-kit measuring a target that no longer exists —
  // so the ban is expressed by withholding the drop ring and re-checked in `onDragEnd`.
  const dropForbidden =
    !dragged ||
    dragged.topicId === topic.topicId ||
    dragged.descendantIds.has(topic.topicId) ||
    dragged.parentId === topic.topicId;

  const { setNodeRef: setDropNodeRef, isOver } = useDroppable({
    id: topic.topicId,
    data: { topicId: topic.topicId } satisfies TopicDropData,
  });

  const setRowRef = useCallback(
    (node: HTMLDivElement | null) => {
      setDragNodeRef(node);
      setDropNodeRef(node);
    },
    [setDragNodeRef, setDropNodeRef]
  );

  // Releasing a drag still fires a click on the row. Swallow it in the capture phase so the
  // CollapsibleTrigger underneath does not toggle the topic on drop.
  const draggedRef = useRef(false);

  useEffect(() => {
    if (isDragging) draggedRef.current = true;
  }, [isDragging]);

  const onClickCapture = useCallback((event: ReactMouseEvent) => {
    if (!draggedRef.current) return;

    draggedRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  }, []);

  return {
    rowProps: {
      ref: setRowRef,
      onClickCapture,
      className: cn(
        'relative rounded-md',
        isDragging && 'opacity-40',
        isOver && !dropForbidden && 'bg-sidebar-accent ring-2 ring-sidebar-ring'
      ),
    },
    handleProps: { ref: setActivatorNodeRef, ...listeners, ...attributes },
  };
}

function TopicSubTreeItem({
  topic,
  openIds,
  onOpenChange,
}: TopicTreeItemProps) {
  const { rowProps, handleProps } = useTopicDnd(topic);

  if (!topic.topics.length) {
    return (
      <SidebarMenuSubItem>
        <div {...rowProps}>
          <SidebarMenuSubButton
            asChild
            className={`text-sidebar-foreground/80 ${grabCursor}`}
          >
            <button type="button" {...handleProps}>
              <TopicLabel topic={topic} />
            </button>
          </SidebarMenuSubButton>
        </div>
      </SidebarMenuSubItem>
    );
  }

  return (
    <Collapsible
      asChild
      open={openIds.has(topic.topicId)}
      onOpenChange={(open) => onOpenChange(topic.topicId, open)}
    >
      <SidebarMenuSubItem>
        <div {...rowProps}>
          <CollapsibleTrigger asChild>
            <SidebarMenuSubButton
              asChild
              className={`text-sidebar-foreground/80 ${grabCursor} ${rotateChevronWhenOpen}`}
            >
              <button type="button" {...handleProps}>
                <TopicLabel topic={topic} />
                <TopicChevron />
              </button>
            </SidebarMenuSubButton>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <SidebarMenuSub className="gap-0">
            {topic.topics.map((child) => (
              <TopicSubTreeItem
                key={child.topicId}
                topic={child}
                openIds={openIds}
                onOpenChange={onOpenChange}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuSubItem>
    </Collapsible>
  );
}

export default function TopicTreeItem({
  topic,
  openIds,
  onOpenChange,
}: TopicTreeItemProps) {
  const { rowProps, handleProps } = useTopicDnd(topic);

  if (!topic.topics.length) {
    return (
      <SidebarMenuItem>
        <div {...rowProps}>
          <SidebarMenuButton
            {...handleProps}
            tooltip={topic.name}
            className={`text-sidebar-foreground/80 ${grabCursor}`}
          >
            <TopicLabel topic={topic} />
          </SidebarMenuButton>
        </div>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible
      asChild
      open={openIds.has(topic.topicId)}
      onOpenChange={(open) => onOpenChange(topic.topicId, open)}
    >
      <SidebarMenuItem>
        <div {...rowProps}>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              {...handleProps}
              tooltip={topic.name}
              className={`text-sidebar-foreground/80 ${grabCursor} ${rotateChevronWhenOpen}`}
            >
              <TopicLabel topic={topic} />
              <TopicChevron />
            </SidebarMenuButton>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <SidebarMenuSub className="gap-0">
            {topic.topics.map((child) => (
              <TopicSubTreeItem
                key={child.topicId}
                topic={child}
                openIds={openIds}
                onOpenChange={onOpenChange}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
