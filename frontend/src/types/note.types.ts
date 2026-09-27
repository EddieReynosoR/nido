import type { Block } from '@blocknote/core';

export type CreateNoteRequest = {
  topicId: string;
  title: string;
  content: Block[];
  isIntro: boolean;
};
