import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { ChevronRight, Folder } from 'lucide-react';
import { CollisionPriority } from '@dnd-kit/abstract';
import { useDraggable, useDroppable } from '@dnd-kit/react';
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
import { canDropTopic, collectDescendantIds } from '@/lib/topic-tree';
import { cn } from '@/lib/utils';
import type { Topic, TopicDragData } from '@/types/topic.types';

type TopicTreeItemProps = {
  topic: Topic;
  openIds: Set<string>;
  onOpenChange: (topicId: string, open: boolean) => void;
};

const AUTO_EXPAND_DELAY_MS = 600;

const rotateChevronWhenOpen = '[&[data-state=open]>svg:last-child]:rotate-90';

const grabCursor = 'cursor-grab active:cursor-grabbing';

function TopicLabel({ topic }: { topic: Topic }) {
  return (
    <>
      <Folder
        className={topic.color ? undefined : 'text-sidebar-foreground/50'}
        style={topic.color ? { color: topic.color } : undefined}
      />
      <span className="truncate select-none">{topic.name}</span>
    </>
  );
}

function TopicChevron() {
  return (
    <ChevronRight className="ml-auto text-sidebar-foreground/40 transition-transform" />
  );
}

function useTopicDnd(
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
        isDragSource && 'opacity-40',
        isDropTarget && 'bg-sidebar-accent ring-2 ring-sidebar-ring'
      ),
    },
    handleProps: { ref: handleRef },
  };
}

function TopicSubTreeItem({
  topic,
  openIds,
  onOpenChange,
}: TopicTreeItemProps) {
  const { rowProps, handleProps } = useTopicDnd(topic, onOpenChange);

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
  const { rowProps, handleProps } = useTopicDnd(topic, onOpenChange);

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
