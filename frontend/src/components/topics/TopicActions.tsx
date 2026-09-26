import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import type { Topic, TopicTreeItemProps } from "@/types/topic.types";
import {
  SidebarMenuAction,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export function TopicActions({
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