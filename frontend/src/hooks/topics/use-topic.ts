import { create, deleteTopic, reparent, updateTopic } from '@/api/topic';
import { spaceContentKey } from '@/hooks/spaces/use-space-content';
import { ApiError, noSessionError } from '@/lib/http';
import { errorToast } from '@/lib/toast';
import {
  insertTopicInTree,
  mapTopicsInContent,
  moveTopicInTree,
  removeTopicFromTree,
  updateTopicInTree,
} from '@/lib/topic-tree';
import type { SpaceContent } from '@/types/space.types';
import type {
  CreateTopicRequest,
  DeleteTopicRequest,
  ReparentRequest,
  Topic,
  UpdateTopicRequest,
} from '@/types/topic.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreate(accessToken: string | null) {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    ApiError,
    CreateTopicRequest,
    { previous?: SpaceContent | null; tempId: string }
  >({
    mutationFn: async (request) => {
      if (!accessToken) throw noSessionError();
      await create(request, accessToken);
    },
    onMutate: async (request) => {
      const queryKey = spaceContentKey(request.spaceId);
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<SpaceContent | null>(queryKey);
      const tempId = crypto.randomUUID();

      const optimisticTopic: Topic = {
        topicId: tempId,
        name: request.name,
        color: request.color,
        spaceId: request.spaceId,
        parentId: request.parentTopicId,
        deletedAt: null,
        topics: [],
        noteId: null,
        notes: [],
      };

      queryClient.setQueryData<SpaceContent | null>(queryKey, (old) =>
        mapTopicsInContent(old, (topics) =>
          insertTopicInTree(topics, optimisticTopic, request.parentTopicId)
        )
      );

      return { previous, tempId };
    },
    onError: (error, request, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          spaceContentKey(request.spaceId),
          context.previous
        );
      }

      errorToast({
        id: `topics-create-error-${context?.tempId}`,
        error,
        title: 'Could not create the folder',
      });
    },
    onSettled: (_data, _error, request) => {
      queryClient.invalidateQueries({
        queryKey: spaceContentKey(request.spaceId),
      });
    },
  });
}

export function useReparent(accessToken: string | null) {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    ApiError,
    ReparentRequest,
    { previous?: SpaceContent | null }
  >({
    mutationFn: async (request) => {
      if (!accessToken) throw noSessionError();
      await reparent(request, accessToken);
    },
    onMutate: async (request) => {
      const queryKey = spaceContentKey(request.spaceId);

      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<SpaceContent | null>(queryKey);

      queryClient.setQueryData<SpaceContent | null>(queryKey, (old) =>
        mapTopicsInContent(old, (topics) =>
          moveTopicInTree(topics, request.topicId, request.newParentId)
        )
      );

      return { previous };
    },
    onError: (error, request, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          spaceContentKey(request.spaceId),
          context.previous
        );
      }

      errorToast({
        id: `topics-reparent-error-${request.topicId}`,
        error,
        title: 'Could not move the folder',
      });
    },
    onSettled: (_data, _error, request) => {
      queryClient.invalidateQueries({
        queryKey: spaceContentKey(request.spaceId),
      });
    },
  });
}

export function useDeleteTopic(accessToken: string | null) {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    ApiError,
    DeleteTopicRequest,
    { previous?: SpaceContent | null }
  >({
    mutationFn: async (request) => {
      if (!accessToken) throw noSessionError();
      await deleteTopic(request.topicId, accessToken);
    },
    onMutate: async (request) => {
      const queryKey = spaceContentKey(request.spaceId);
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<SpaceContent | null>(queryKey);

      queryClient.setQueryData<SpaceContent | null>(queryKey, (old) =>
        mapTopicsInContent(old, (topics) =>
          removeTopicFromTree(topics, request.topicId)
        )
      );

      return { previous };
    },
    onError: (error, request, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          spaceContentKey(request.spaceId),
          context.previous
        );
      }

      errorToast({
        id: `topics-delete-error-${request.topicId}`,
        error,
        title: 'Could not delete the folder',
      });
    },
    onSettled: (_data, _error, request) => {
      queryClient.invalidateQueries({
        queryKey: spaceContentKey(request.spaceId),
      });
    },
  });
}

export function useUpdateTopic(accessToken: string | null) {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    ApiError,
    UpdateTopicRequest,
    { previous?: SpaceContent | null }
  >({
    mutationFn: async (request) => {
      if (!accessToken) throw noSessionError();
      await updateTopic(request, accessToken);
    },
    onMutate: async (request) => {
      const queryKey = spaceContentKey(request.spaceId);
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<SpaceContent | null>(queryKey);

      queryClient.setQueryData<SpaceContent | null>(queryKey, (old) =>
        mapTopicsInContent(old, (topics) =>
          updateTopicInTree(topics, request.topicId, {
            name: request.name,
            color: request.color,
          })
        )
      );

      return { previous };
    },
    onError: (error, request, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          spaceContentKey(request.spaceId),
          context.previous
        );
      }

      errorToast({
        id: `topics-update-error-${request.topicId}`,
        error,
        title: 'Could not update the folder',
      });
    },
    onSettled: (_data, _error, request) => {
      queryClient.invalidateQueries({
        queryKey: spaceContentKey(request.spaceId),
      });
    },
  });
}
