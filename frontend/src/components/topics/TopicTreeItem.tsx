import {
  ChevronRight,
  Folder
} from 'lucide-react';
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
  SidebarMenuSubItem
} from '@/components/ui/sidebar';
import type { Topic, TopicTreeItemProps } from '@/types/topic.types';

import { TopicActions } from './TopicActions';

import { useTopicDnd } from '@/hooks/topics/use-topic-dnd';
import { useTopicSelection } from '@/hooks/topics/use-topic-selection';

import { grabCursor, revealOnHover, revealOnHoverSub, rotateChevronWhenOpen } from '@/constants/const';

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
