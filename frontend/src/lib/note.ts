import { BlockNoteEditor } from '@blocknote/core';
import type { CreateNoteRequest } from '@/types/note.types';
import type { Topic } from '@/types/topic.types';

export function buildIntroNoteRequest(topic: Topic): CreateNoteRequest {
  return {
    topicId: topic.topicId,
    title: topic.name,
    content: BlockNoteEditor.create({
      initialContent: [
        { type: 'heading', props: { level: 1 }, content: topic.name },
        { type: 'paragraph', content: 'Start writing your note here...' },
      ],
    }).document,
    isIntro: true,
  };
}
