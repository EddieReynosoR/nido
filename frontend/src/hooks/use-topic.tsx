import { getTopics, reparent } from '@/api/topic';
import { errorToast } from '@/lib/toast';
import { moveTopicInTree } from '@/lib/topic-tree';
import type { ReparentRequest, Topic } from '@/types/topic.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useTopics(
  spaceId: string | undefined,
  accessToken: string | null
) {
  return useQuery({
    queryKey: ['topics', spaceId],
    queryFn: () => getTopics(spaceId!, accessToken!),
    enabled: !!spaceId && !!accessToken,
    staleTime: 30000,
  });
}

export function useReparent(accessToken: string | null) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, ReparentRequest, { previous?: Topic[] }>({
    mutationFn: async (request) => {
      await reparent(request, accessToken!);
    },
    onMutate: async (request) => {
      const queryKey = ['topics', request.spaceId];

      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<Topic[]>(queryKey);

      queryClient.setQueryData<Topic[]>(queryKey, (old) =>
        old ? moveTopicInTree(old, request.topicId, request.newParentId) : old
      );

      return { previous };
    },
    onError: (error, request, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['topics', request.spaceId], context.previous);
      }

      errorToast({
        id: `topics-reparent-error-${request.topicId}`,
        error,
        title: 'Could not move the folder',
      });
    },
    onSettled: (_data, _error, request) => {
      queryClient.invalidateQueries({ queryKey: ['topics', request.spaceId] });
    },
  });
}
