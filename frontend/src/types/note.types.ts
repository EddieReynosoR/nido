import type { PartialBlock } from '@blocknote/core';

export type CreateNoteRequest = {
  topicId: string;
  title: string;
  content: PartialBlock[];
  isIntro: boolean;
};

export type Note = {
  noteId: string;
  title: string;
  content: PartialBlock[];
  topicId: string;
  isIntro: boolean;
  version: number;
  updatedAt: string;
};

export type UpdateNoteContentRequest = {
  content: PartialBlock[];
  version: number;
};

export type NoteContentResponse = {
  version: number;
  updatedAt: string;
};
