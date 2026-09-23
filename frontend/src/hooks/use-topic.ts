import {
  create,
  deleteTopic,
  getTopics,
  reparent,
  updateTopic,
} from '@/api/topic';
import { HttpError } from '@/lib/http';
import { errorToast, invalidSessionToast } from '@/lib/toast';
import {
  insertTopicInTree,
  moveTopicInTree,
  removeTopicFromTree,
  updateTopicInTree,
} from '@/lib/topic-tree';
import type {
  CreateTopicRequest,
  DeleteTopicRequest,
  ReparentRequest,
  Topic,
  UpdateTopicRequest,
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
    HttpError,
    CreateTopicRequest,
    { previous?: Topic[]; tempId: string }
  >({
    mutationFn: async (request) => {
      if (!accessToken) throw new HttpError('NO_SESSION', 400);
      await create(request, accessToken);
    },
    onMutate: async (request) => {
      const queryKey = ['topics', request.spaceId];
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<Topic[]>(queryKey);
      const tempId = crypto.randomUUID();

      const optimisticTopic: Topic = {
        topicId: tempId,
        name: request.name,
        color: request.color,
        spaceId: request.spaceId,
        parentId: request.parentTopicId,
        deletedAt: null,
        topics: [],
      };

      queryClient.setQueryData<Topic[]>(queryKey, (old) =>
        old
          ? insertTopicInTree(old, optimisticTopic, request.parentTopicId)
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
          id: `topics-create-error-${context?.tempId}`,
          error,
          customMessage:
            error.status === 409
              ? `Topic with name ${request.name} already exists at the current level.`
              : undefined,
          title: 'Could not create the folder',
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
      if (context?.previous) {
        queryClient.setQueryData(['topics', request.spaceId], context.previous);
      }

      if (error.message === 'NO_SESSION') invalidSessionToast();
      else {
        errorToast({
          id: `topics-reparent-error-${request.topicId}`,
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

export function useDeleteTopic(accessToken: string | null) {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    HttpError,
    DeleteTopicRequest,
    { previous?: Topic[] }
  >({
    mutationFn: async (request) => {
      if (!accessToken) throw new HttpError('NO_SESSION', 400);
      await deleteTopic(request.topicId, accessToken);
    },
    onMutate: async (request) => {
      const queryKey = ['topics', request.spaceId];
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<Topic[]>(queryKey);

      queryClient.setQueryData<Topic[]>(queryKey, (old) =>
        old ? removeTopicFromTree(old, request.topicId) : old
      );

      return { previous };
    },
    onError: (error, request, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['topics', request.spaceId], context.previous);
      }

      if (error.message === 'NO_SESSION') invalidSessionToast();
      else {
        errorToast({
          id: `topics-delete-error-${request.topicId}`,
          error,
          title: 'Could not delete the folder',
        });
      }
    },
    onSettled: (_data, _error, request) => {
      queryClient.invalidateQueries({ queryKey: ['topics', request.spaceId] });
    },
  });
}

export function useUpdateTopic(accessToken: string | null) {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    HttpError,
    UpdateTopicRequest,
    { previous?: Topic[] }
  >({
    mutationFn: async (request) => {
      if (!accessToken) throw new HttpError('NO_SESSION', 400);
      await updateTopic(request, accessToken);
    },
    onMutate: async (request) => {
      const queryKey = ['topics', request.spaceId];
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<Topic[]>(queryKey);

      queryClient.setQueryData<Topic[]>(queryKey, (old) =>
        old
          ? updateTopicInTree(old, request.topicId, {
              name: request.name,
              color: request.color,
            })
          : old
      );

      return { previous };
    },
    onError: (error, request, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['topics', request.spaceId], context.previous);
      }

      if (error.message === 'NO_SESSION') invalidSessionToast();
      else {
        errorToast({
          id: `topics-update-error-${request.topicId}`,
          error,
          customMessage:
            error.status === 409
              ? `Topic with name ${request.name} already exists at the current level.`
              : undefined,
          title: 'Could not update the folder',
        });
      }
    },
    onSettled: (_data, _error, request) => {
      queryClient.invalidateQueries({ queryKey: ['topics', request.spaceId] });
    },
  });
}
