import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FilePlus,
  FileX,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import type { Topic, TopicTreeItemProps } from '@/types/topic.types';
import { SidebarMenuAction, useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export function TopicActions({
  topic,
  onAddChild,
  onAddNote,
  onEdit,
  onDelete,
  onDeleteNote,
  className,
}: {
  topic: Topic;
  onAddChild: TopicTreeItemProps['onAddChild'];
  onAddNote: TopicTreeItemProps['onAddNote'];
  onEdit: TopicTreeItemProps['onEdit'];
  onDelete: TopicTreeItemProps['onDelete'];
  onDeleteNote: TopicTreeItemProps['onDeleteNote'];
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
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Topics
        </DropdownMenuLabel>

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

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Notes
        </DropdownMenuLabel>

        <DropdownMenuItem onSelect={() => onAddNote(topic)}>
          <FilePlus className="text-accent-green" />
          Add note
        </DropdownMenuItem>

        <DropdownMenuItem
          variant="destructive"
          disabled={!topic.noteId}
          onSelect={() => onDeleteNote(topic)}
        >
          <FileX />
          Delete intro note
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
