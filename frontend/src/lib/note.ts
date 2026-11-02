import type { PartialBlock } from '@blocknote/core';
import type { CreateNoteRequest } from '@/types/note.types';
import type { Topic } from '@/types/topic.types';

export function buildNoteContent(title: string): PartialBlock[] {
  return [
    { type: 'heading', props: { level: 1 }, content: title },
    { type: 'paragraph', content: 'Start writing your note here...' },
  ];
}

export function buildIntroNoteRequest(topic: Topic): CreateNoteRequest {
  return {
    spaceId: topic.spaceId,
    topicId: topic.topicId,
    title: topic.name,
    content: buildNoteContent(topic.name),
    isIntro: true,
  };
}

export function buildTopicNoteRequest(
  topic: Topic,
  title: string
): CreateNoteRequest {
  return {
    spaceId: topic.spaceId,
    topicId: topic.topicId,
    title,
    content: buildNoteContent(title),
    isIntro: false,
  };
}

export function buildRootNoteRequest(
  spaceId: string,
  title: string
): CreateNoteRequest {
  return {
    spaceId,
    topicId: null,
    title,
    content: buildNoteContent(title),
    isIntro: false,
  };
}
