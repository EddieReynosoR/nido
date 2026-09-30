import { useState } from 'react';
import { Navigate, useParams } from 'react-router';
import NoteEditor from '@/components/notes/NoteEditor';
import NoteMessage from '@/components/notes/NoteMessage';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useSpace } from '@/context/SpaceContext';
import { useCreateNote } from '@/hooks/notes/use-note';
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
  const createNote = useCreateNote(accessToken, activeSpace?.spaceId);
  const [draft, setDraft] = useState<CreateNoteRequest | null>(null);

  if (spacesLoading || topicsLoading) return null;

  const topic = topics && topicId ? findTopicInTree(topics, topicId) : null;

  if (!topic) return <Navigate to="/" replace />;

  if (draft?.topicId === topic.topicId) {
    return <NoteEditor key={draft.topicId} initialContent={draft.content} />;
  }

  if (topic.noteId) return <NoteEditor key={topic.noteId} />;

  return (
    <NoteMessage>
      <div className="flex flex-col items-center gap-3">
        <p>There&apos;s no intro note for this topic yet. Create a new one.</p>
        <Button
          disabled={createNote.isPending}
          onClick={() => {
            const request = buildIntroNoteRequest(topic);
            setDraft(request);
            createNote.mutate(request, { onError: () => setDraft(null) });
          }}
        >
          Create note
        </Button>
      </div>
    </NoteMessage>
  );
}
