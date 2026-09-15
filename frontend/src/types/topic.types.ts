export type Topic = {
  topicId: string;
  name: string;
  color: string;
  parentId: string | null;
  spaceId: string;
  deletedAt: string | null;
  topics: Topic[];
};

export type ReparentRequest = {
  topicId: string;
  spaceId: string;
  newParentId: string | null;
};

export type TopicDragData = {
  topicId: string;
  parentId: string | null;
  name: string;
  descendantIds: Set<string>;
};
