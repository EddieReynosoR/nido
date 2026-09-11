export type Topic = {
    topicId: string;
    name: string;
    color: string;
    parentId: string;
    spaceId: string;
    deletedAt: string;
    topics: Topic[];
}