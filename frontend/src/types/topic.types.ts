import type { NoteTreeItem } from '@/types/note.types';

export type Topic = {
  topicId: string;
  name: string;
  color: string;
  parentId: string | null;
  spaceId: string;
  deletedAt: string | null;
  topics: Topic[];
  noteId: string | null;
  notes: NoteTreeItem[];
};

export type ReparentRequest = {
  topicId: string;
  spaceId: string;
  newParentId: string | null;
};

export type CreateTopicRequest = {
  name: string;
  color: string;
  spaceId: string;
  parentTopicId: string | null;
};

export type TopicDragData = {
  topicId: string;
  parentId: string | null;
  name: string;
  descendantIds: Set<string>;
};

export type DeleteTopicRequest = {
  topicId: string;
  spaceId: string;
};

export type UpdateTopicRequest = {
  topicId: string;
  spaceId: string;
  name: string;
  color: string;
};

export type TopicTreeItemProps = {
  topic: Topic;
  openIds: Set<string>;
  activePath: string[] | null;
  onOpenChange: (topicId: string, open: boolean) => void;
  onAddChild: (topic: Topic) => void;
  onAddNote: (topic: Topic) => void;
  onEdit: (topic: Topic) => void;
  onDelete: (topic: Topic) => void;
  onDeleteNote: (topic: Topic) => void;
  onDeleteNoteItem: (note: NoteTreeItem) => void;
  onRenameNoteItem: (note: NoteTreeItem) => void;
};
