import { create, getTopics, reparent } from '@/api/topic';
import { errorToast, invalidSessionToast } from '@/lib/toast';
import { moveTopicInTree } from '@/lib/topic-tree';
import type {
  CreateTopicRequest,
  ReparentRequest,
  Topic,
} from '@/types/topic.types';
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

export function useCreate(accessToken: string | null) {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    CreateTopicRequest,
    { previous?: Topic[]; tempId: string }
  >({
    mutationFn: async (request) => {
      if (!accessToken) throw new Error('NO_SESSION');
      await create(request, accessToken);
    },
    onMutate: async (request) => {
      const queryKey = ['topics', request.spaceId];
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<Topic[]>(queryKey);
      const tempId = crypto.randomUUID();

      const optimicticTopic: Topic = {
        topicId: `${tempId}`,
        name: request.name,
        color: request.color,
        spaceId: request.spaceId,
        parentId: request.parentTopicId,
        deletedAt: null,
        topics: [],
      };

      queryClient.setQueryData<Topic[]>(queryKey, (old) =>
        old
          ? moveTopicInTree(old, optimicticTopic.topicId, request.parentTopicId)
          : old
      );

      return { previous, tempId };
    },
    onError: (error, request, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['topics', request.spaceId], context.previous);
      }

      if (error.message === 'NO_SESSION') invalidSessionToast();
      else {
        errorToast({
          id: `topics-reparent-error-${context?.tempId}`,
          error,
          title: 'Could not move the folder',
        });
      }
    },
    onSettled: (_data, _error, request) => {
      queryClient.invalidateQueries({ queryKey: ['topics', request.spaceId] });
    },
  });
}

export function useReparent(accessToken: string | null) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, ReparentRequest, { previous?: Topic[] }>({
    mutationFn: async (request) => {
      if (!accessToken) throw new Error('NO_SESSION');
      await reparent(request, accessToken);
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
      if (error.message === 'NO_SESSION') invalidSessionToast();

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
