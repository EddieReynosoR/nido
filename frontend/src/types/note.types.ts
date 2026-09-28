import type { PartialBlock } from '@blocknote/core';

export type CreateNoteRequest = {
  topicId: string;
  title: string;
  content: PartialBlock[];
  isIntro: boolean;
};
