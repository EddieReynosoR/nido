import { useState } from 'react';
import { Navigate, useParams } from 'react-router';
import NoteEditor from '@/components/notes/NoteEditor';
import NoteMessage from '@/components/notes/NoteMessage';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useSpace } from '@/context/SpaceContext';
import { useCreateNote, useNote } from '@/hooks/notes/use-note';
import { useTopics } from '@/hooks/topics/use-topic';
import { buildIntroNoteRequest } from '@/lib/note';
import { findTopicInTree } from '@/lib/topic-tree';
import type { CreateNoteRequest } from '@/types/note.types';

export default function TopicNotePage() {
  const { topicId } = useParams();
  const { accessToken } = useAuth();
  const { activeSpace, isLoading: spacesLoading } = useSpace();
  const { data: topics, isLoading: topicsLoading } = useTopics(
    activeSpace?.spaceId,
    accessToken
  );
  const topic = topics && topicId ? findTopicInTree(topics, topicId) : null;
  const {
    data: note,
    isLoading: noteLoading,
    isError: noteError,
  } = useNote(topic?.noteId, accessToken);
  const { mutate: createNote, isPending } = useCreateNote(
    accessToken,
    activeSpace?.spaceId
  );
  const [draft, setDraft] = useState<CreateNoteRequest | null>(null);

  if (spacesLoading || topicsLoading) return null;

  if (!topic) return <Navigate to="/" replace />;

  if (draft?.topicId === topic.topicId) {
    return <NoteEditor key={topic.topicId} initialContent={draft.content} />;
  }

  if (topic.noteId) {
    if (noteLoading) return null;

    if (noteError || !note) {
      return <NoteMessage>Could not load this note.</NoteMessage>;
    }

    return (
      <NoteEditor
        key={topic.topicId}
        initialContent={note.content.length ? note.content : undefined}
      />
    );
  }

  return (
    <NoteMessage>
      <div className="flex flex-col items-center gap-3">
        <p>There&apos;s no intro note for this topic yet. Create a new one.</p>
        <Button
          disabled={isPending}
          onClick={() => {
            const request = buildIntroNoteRequest(topic);
            setDraft(request);
            createNote(request, { onSettled: () => setDraft(null) });
          }}
        >
          Create note
        </Button>
      </div>
    </NoteMessage>
  );
}
