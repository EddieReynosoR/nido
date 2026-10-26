import type { PartialBlock } from '@blocknote/core';

export type CreateNoteRequest = {
  spaceId: string;
  topicId: string | null;
  title: string;
  content: PartialBlock[];
  isIntro: boolean;
};

export type Note = {
  noteId: string;
  title: string;
  content: PartialBlock[];
  spaceId: string;
  topicId: string | null;
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

export type NoteTreeItem = {
  noteId: string;
  title: string;
  spaceId: string;
  topicId: string | null;
  version: number;
  updatedAt: string;
};

export type NoteTab = {
  type: 'topic' | 'note';
  id: string;
};
