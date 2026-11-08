import { FileX, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenuAction, useSidebar } from '@/components/ui/sidebar';
import type { NoteTreeItem } from '@/types/note.types';

export default function NoteActions({
  note,
  onDelete,
}: {
  note: NoteTreeItem;
  onDelete: (note: NoteTreeItem) => void;
}) {
  const { isMobile } = useSidebar();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuAction
          aria-label={`Note options for ${note.title}`}
          className="text-sidebar-foreground/60"
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
        <DropdownMenuItem variant="destructive" onSelect={() => onDelete(note)}>
          <FileX />
          Delete note
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
