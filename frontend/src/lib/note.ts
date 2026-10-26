import type { CreateNoteRequest } from '@/types/note.types';
import type { Topic } from '@/types/topic.types';

export function buildIntroNoteRequest(topic: Topic): CreateNoteRequest {
  return {
    spaceId: topic.spaceId,
    topicId: topic.topicId,
    title: topic.name,
    content: [
      { type: 'heading', props: { level: 1 }, content: topic.name },
      { type: 'paragraph', content: 'Start writing your note here...' },
    ],
    isIntro: true,
  };
}
