import { useNavigate, useParams } from 'react-router';
import type { Topic } from '@/types/topic.types';

export function useTopicSelection(topic: Topic) {
  const navigate = useNavigate();
  const { topicId } = useParams();

  return {
    isActive: topicId === topic.topicId,
    onSelect: () => navigate(`/topics/${topic.topicId}`),
  };
}