import { useNavigate } from 'react-router';
import type { Topic } from '@/types/topic.types';

export function useTopicSelection(topic: Topic) {
  const navigate = useNavigate();

  return {
    onSelect: () => navigate(`/topics/${topic.topicId}`),
  };
}
