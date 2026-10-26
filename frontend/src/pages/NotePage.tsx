import { Navigate, useParams } from 'react-router';
import NoteEditor from '@/components/notes/NoteEditor';
import NoteMessage from '@/components/notes/NoteMessage';
import { useAuth } from '@/context/AuthContext';
import { useSpace } from '@/context/SpaceContext';
import { useNote } from '@/hooks/notes/use-note';
import { useSpaceContent } from '@/hooks/spaces/use-space-content';
import { findNoteInContent } from '@/lib/topic-tree';

export default function NotePage() {
  const { noteId } = useParams();
  const { accessToken } = useAuth();
  const { activeSpace, isLoading: spacesLoading } = useSpace();
  const { data: content, isLoading: contentLoading } = useSpaceContent(
    activeSpace?.spaceId,
    accessToken
  );
  const treeNote =
    content && noteId ? findNoteInContent(content, noteId) : null;
  const {
    data: note,
    isLoading: noteLoading,
    isError: noteError,
  } = useNote(treeNote?.noteId, accessToken);

  if (spacesLoading || contentLoading) return null;

  if (!treeNote) return <Navigate to="/" replace />;

  if (noteLoading) return null;

  if (noteError || !note) {
    return <NoteMessage>Could not load this note.</NoteMessage>;
  }

  return (
    <NoteEditor
      key={note.noteId}
      initialContent={note.content.length ? note.content : undefined}
      noteId={note.noteId}
      updatedAt={note.updatedAt}
    />
  );
}
