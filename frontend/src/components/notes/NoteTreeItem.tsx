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
import { useNoteDnd } from '@/hooks/topics/use-note-dnd';
import { grabCursor, revealOnHover, revealOnHoverSub } from '@/constants/const';

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
  onRename,
  onDelete,
}: {
  note: NoteTreeItemType;
  nested?: boolean;
  onRename: (note: NoteTreeItemType) => void;
  onDelete: (note: NoteTreeItemType) => void;
}) {
  const navigate = useNavigate();
  const { noteId } = useParams();
  const isActive = noteId === note.noteId;
  const onSelect = () => navigate(`/notes/${note.noteId}`);
  const { rowProps, handleProps } = useNoteDnd(note);

  if (nested) {
    return (
      <SidebarMenuSubItem {...rowProps}>
        <SidebarMenuSubButton
          asChild
          isActive={isActive}
          className={`w-full text-sidebar-foreground/80 ${grabCursor}`}
        >
          <button type="button" {...handleProps} onClick={onSelect}>
            <NoteLabel note={note} />
          </button>
        </SidebarMenuSubButton>
        <NoteActions
          note={note}
          onRename={onRename}
          onDelete={onDelete}
          className={revealOnHoverSub}
        />
      </SidebarMenuSubItem>
    );
  }

  return (
    <SidebarMenuItem {...rowProps}>
      <SidebarMenuButton
        {...handleProps}
        tooltip={note.title}
        isActive={isActive}
        onClick={onSelect}
        className={`text-sidebar-foreground/80 ${grabCursor}`}
      >
        <NoteLabel note={note} />
      </SidebarMenuButton>
      <NoteActions
        note={note}
        onRename={onRename}
        onDelete={onDelete}
        className={revealOnHover}
      />
    </SidebarMenuItem>
  );
}
