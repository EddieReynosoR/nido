import { ChevronRight, Folder } from 'lucide-react';
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
} from '@/components/ui/sidebar';
import type { Topic } from '@/types/topic.types';

type TopicTreeItemProps = {
  topic: Topic;
};

const rotateChevronWhenOpen = '[&[data-state=open]>svg:last-child]:rotate-90';

function TopicLabel({ topic }: TopicTreeItemProps) {
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

function TopicSubTreeItem({ topic }: TopicTreeItemProps) {
  if (!topic.topics.length) {
    return (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton asChild className="text-sidebar-foreground/80">
          <button type="button">
            <TopicLabel topic={topic} />
          </button>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  }

  return (
    <Collapsible asChild>
      <SidebarMenuSubItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuSubButton
            asChild
            className={`text-sidebar-foreground/80 ${rotateChevronWhenOpen}`}
          >
            <button type="button">
              <TopicLabel topic={topic} />
              <TopicChevron />
            </button>
          </SidebarMenuSubButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {topic.topics.map((child) => (
              <TopicSubTreeItem key={child.topicId} topic={child} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuSubItem>
    </Collapsible>
  );
}

export default function TopicTreeItem({ topic }: TopicTreeItemProps) {
  if (!topic.topics.length) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip={topic.name}
          className="text-sidebar-foreground/80"
        >
          <TopicLabel topic={topic} />
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible asChild>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={topic.name}
            className={`text-sidebar-foreground/80 ${rotateChevronWhenOpen}`}
          >
            <TopicLabel topic={topic} />
            <TopicChevron />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {topic.topics.map((child) => (
              <TopicSubTreeItem key={child.topicId} topic={child} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
