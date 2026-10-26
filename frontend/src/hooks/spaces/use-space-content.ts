import { useQuery } from '@tanstack/react-query';
import { getSpaceContent } from '@/api/space';
import type { NoteTreeItem } from '@/types/note.types';
import type { SpaceContent } from '@/types/space.types';
import type { Topic } from '@/types/topic.types';

export const spaceContentKey = (spaceId: string | undefined) => [
  'content',
  spaceId,
];

export const selectTopics = (content: SpaceContent | null): Topic[] =>
  content?.topics ?? [];

export const selectRootNotes = (content: SpaceContent | null): NoteTreeItem[] =>
  content?.notes ?? [];

export function useSpaceContent<TData = SpaceContent | null>(
  spaceId: string | undefined,
  accessToken: string | null,
  select?: (content: SpaceContent | null) => TData
) {
  return useQuery({
    queryKey: spaceContentKey(spaceId),
    queryFn: () => getSpaceContent(spaceId!, accessToken!),
    enabled: !!spaceId && !!accessToken,
    staleTime: 30000,
    select,
  });
}
