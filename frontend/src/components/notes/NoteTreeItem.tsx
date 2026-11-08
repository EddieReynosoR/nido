import { FileText } from 'lucide-react';
import NoteActions from '@/components/notes/NoteActions';
import { useNavigate, useParams } from 'react-router';
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import type { NoteTreeItem as NoteTreeItemType } from '@/types/note.types';

function NoteLabel({ note }: { note: NoteTreeItemType }) {
  return (
    <>
      <FileText className="text-sidebar-foreground/50" />
      <span className="truncate select-none">{note.title}</span>
    </>
  );
}

export default function NoteTreeItem({
  note,
  nested = false,
  onDelete,
}: {
  note: NoteTreeItemType;
  nested?: boolean;
  onDelete?: (note: NoteTreeItemType) => void;
}) {
  const navigate = useNavigate();
  const { noteId } = useParams();
  const isActive = noteId === note.noteId;
  const onSelect = () => navigate(`/notes/${note.noteId}`);

  if (nested) {
    return (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton
          asChild
          isActive={isActive}
          className="w-full text-sidebar-foreground/80"
        >
          <button type="button" onClick={onSelect}>
            <NoteLabel note={note} />
          </button>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={note.title}
        isActive={isActive}
        onClick={onSelect}
        className="text-sidebar-foreground/80"
      >
        <NoteLabel note={note} />
      </SidebarMenuButton>
      {onDelete && <NoteActions note={note} onDelete={onDelete} />}
    </SidebarMenuItem>
  );
}
