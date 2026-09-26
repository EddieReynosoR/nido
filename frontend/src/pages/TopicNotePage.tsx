import { Navigate, useParams } from 'react-router';
import NoteEditor from '@/components/notes/NoteEditor';
import NoteMessage from '@/components/notes/NoteMessage';
import { useAuth } from '@/context/AuthContext';
import { useSpace } from '@/context/SpaceContext';
import { useTopics } from '@/hooks/use-topic';
import { findTopicInTree } from '@/lib/topic-tree';

export default function TopicNotePage() {
  const { topicId } = useParams();
  const { accessToken } = useAuth();
  const { activeSpace, isLoading: spacesLoading } = useSpace();
  const { data: topics, isLoading: topicsLoading } = useTopics(
    activeSpace?.spaceId,
    accessToken
  );

  if (spacesLoading || topicsLoading) return null;

  const topic = topics && topicId ? findTopicInTree(topics, topicId) : null;

  if (!topic) return <Navigate to="/" replace />;

  if (!topic.noteId) {
    return (
      <NoteMessage>
        There&apos;s no intro note for this topic yet. Create a new one.
      </NoteMessage>
    );
  }

  return <NoteEditor key={topic.noteId} />;
}
