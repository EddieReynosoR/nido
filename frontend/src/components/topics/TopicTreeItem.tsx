import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import {
  ChevronRight,
  Folder,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { CollisionPriority } from '@dnd-kit/abstract';
import { useDraggable, useDroppable } from '@dnd-kit/react';
import { useNavigate, useParams } from 'react-router';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarMenuAction,
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
  onAddChild: (topic: Topic) => void;
  onEdit: (topic: Topic) => void;
  onDelete: (topic: Topic) => void;
};

const AUTO_EXPAND_DELAY_MS = 600;

const rotateChevronWhenOpen = '[&[data-state=open]>svg:last-child]:rotate-90';

const grabCursor = 'cursor-grab active:cursor-grabbing';

const revealOnHover =
  'md:opacity-0 group-hover/menu-item:opacity-100 group-has-[:focus-visible]/menu-item:opacity-100 aria-expanded:opacity-100';

const revealOnHoverSub =
  'top-1 md:opacity-0 group-hover/menu-sub-item:opacity-100 group-has-[:focus-visible]/menu-sub-item:opacity-100 aria-expanded:opacity-100';

function TopicLabel({ topic }: { topic: Topic }) {
  return (
    <>
      <Folder
        className={topic.color ? undefined : 'text-sidebar-foreground/50'}
        style={topic.color ? { color: `#${topic.color}` } : undefined}
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

function TopicActions({
  topic,
  onAddChild,
  onEdit,
  onDelete,
  className,
}: {
  topic: Topic;
  onAddChild: TopicTreeItemProps['onAddChild'];
  onEdit: TopicTreeItemProps['onEdit'];
  onDelete: TopicTreeItemProps['onDelete'];
  className?: string;
}) {
  const { isMobile } = useSidebar();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuAction
          aria-label={`Folder options for ${topic.name}`}
          className={cn('text-sidebar-foreground/60', className)}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <MoreHorizontal />
        </SidebarMenuAction>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-44 rounded-lg"
        align="start"
        side={isMobile ? 'bottom' : 'right'}
        sideOffset={4}
      >
        <DropdownMenuItem onSelect={() => onAddChild(topic)}>
          <Plus className="text-accent-green" />
          Add topic
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={() => onEdit(topic)}>
          <Pencil />
          Edit topic
        </DropdownMenuItem>

        <DropdownMenuItem
          variant="destructive"
          onSelect={() => onDelete(topic)}
        >
          <Trash2 />
          Delete topic
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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

function useTopicSelection(topic: Topic) {
  const navigate = useNavigate();
  const { topicId } = useParams();

  return {
    isActive: topicId === topic.topicId,
    onSelect: () => navigate(`/topics/${topic.topicId}`),
  };
}

function TopicSubTreeItem({
  topic,
  openIds,
  onOpenChange,
  onAddChild,
  onEdit,
  onDelete,
}: TopicTreeItemProps) {
  const { rowProps, handleProps } = useTopicDnd(topic, onOpenChange);
  const { isActive, onSelect } = useTopicSelection(topic);

  if (!topic.topics.length) {
    return (
      <SidebarMenuSubItem>
        <div {...rowProps}>
          <SidebarMenuSubButton
            asChild
            isActive={isActive}
            className={`w-full pr-8 text-sidebar-foreground/80 ${grabCursor}`}
          >
            <button type="button" {...handleProps} onClick={onSelect}>
              <TopicLabel topic={topic} />
            </button>
          </SidebarMenuSubButton>
          <TopicActions
            topic={topic}
            onAddChild={onAddChild}
            onEdit={onEdit}
            onDelete={onDelete}
            className={revealOnHoverSub}
          />
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
              isActive={isActive}
              className={`w-full pr-8 text-sidebar-foreground/80 ${grabCursor} ${rotateChevronWhenOpen}`}
            >
              <button type="button" {...handleProps} onClick={onSelect}>
                <TopicLabel topic={topic} />
                <TopicChevron />
              </button>
            </SidebarMenuSubButton>
          </CollapsibleTrigger>
          <TopicActions
            topic={topic}
            onAddChild={onAddChild}
            onEdit={onEdit}
            onDelete={onDelete}
            className={revealOnHoverSub}
          />
        </div>
        <CollapsibleContent>
          <SidebarMenuSub className="mr-0 gap-0 pr-0">
            {topic.topics.map((child) => (
              <TopicSubTreeItem
                key={child.topicId}
                topic={child}
                openIds={openIds}
                onOpenChange={onOpenChange}
                onAddChild={onAddChild}
                onEdit={onEdit}
                onDelete={onDelete}
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
  onAddChild,
  onEdit,
  onDelete,
}: TopicTreeItemProps) {
  const { rowProps, handleProps } = useTopicDnd(topic, onOpenChange);
  const { isActive, onSelect } = useTopicSelection(topic);

  if (!topic.topics.length) {
    return (
      <SidebarMenuItem>
        <div {...rowProps}>
          <SidebarMenuButton
            {...handleProps}
            tooltip={topic.name}
            isActive={isActive}
            onClick={onSelect}
            className={`text-sidebar-foreground/80 ${grabCursor}`}
          >
            <TopicLabel topic={topic} />
          </SidebarMenuButton>
          <TopicActions
            topic={topic}
            onAddChild={onAddChild}
            onEdit={onEdit}
            onDelete={onDelete}
            className={revealOnHover}
          />
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
              isActive={isActive}
              onClick={onSelect}
              className={`pr-8 text-sidebar-foreground/80 ${grabCursor} ${rotateChevronWhenOpen}`}
            >
              <TopicLabel topic={topic} />
              <TopicChevron />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <TopicActions
            topic={topic}
            onAddChild={onAddChild}
            onEdit={onEdit}
            onDelete={onDelete}
            className={revealOnHover}
          />
        </div>
        <CollapsibleContent>
          <SidebarMenuSub className="mr-0 gap-0 pr-0">
            {topic.topics.map((child) => (
              <TopicSubTreeItem
                key={child.topicId}
                topic={child}
                openIds={openIds}
                onOpenChange={onOpenChange}
                onAddChild={onAddChild}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
