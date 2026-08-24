import { useCallback, useMemo, useRef, type RefObject } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getSpaces, addSpace, deleteSpace } from '@/api/space';
import { errorToast } from '@/lib/toast';
import type { getSpaceResponse, Space } from '@/types/space.types';
import SpaceUndoToast from '@/components/spaces/SpaceUndoToast';

const UNDO_WINDOW_MS = 5000;

const undoToastId = (spaceId: string) => `spaces-delete-undo-${spaceId}`;

export function useSpaces(accessToken: string | null) {
  return useQuery({
    queryKey: ['spaces', accessToken],
    queryFn: () => getSpaces(accessToken!),
    enabled: !!accessToken,
    staleTime: 30000,
  });
}

export function useCreateSpace(accessToken: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => addSpace(name, accessToken!),
    onSuccess: (newSpace) => {
      if (newSpace) {
        queryClient.setQueryData<getSpaceResponse>(
          ['spaces', accessToken],
          (old) => (old ? { ...old, content: [...old.content, newSpace] } : old)
        );
      }
    },
  });
}

export function useDeleteSpace(accessToken: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (spaceId: string) => deleteSpace(spaceId, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
    },
  });
}

export function useDeleteSpaceWithUndo(
  accessToken: string | null,
  timersRef: RefObject<Map<string, number>>,
  options?: { onRestore?: (space: Space) => void }
) {
  const queryClient = useQueryClient();
  const { mutate } = useDeleteSpace(accessToken);

  const onRestoreRef = useRef(options?.onRestore);
  onRestoreRef.current = options?.onRestore;

  const deadlinesRef = useRef(new Map<string, number>());
  const pausedRef = useRef(new Map<string, number>());

  const spacesKey = useMemo(() => ['spaces', accessToken], [accessToken]);

  const removeFromCache = useCallback(
    (spaceId: string) => {
      queryClient.setQueryData<getSpaceResponse>(spacesKey, (old) =>
        old
          ? {
              ...old,
              content: old.content.filter((space) => space.spaceId !== spaceId),
            }
          : old
      );
    },
    [queryClient, spacesKey]
  );

  const restoreToCache = useCallback(
    (space: Space) => {
      queryClient.setQueryData<getSpaceResponse>(spacesKey, (old) => {
        if (!old) return old;
        if (old.content.some((item) => item.spaceId === space.spaceId)) {
          return old;
        }

        return {
          ...old,
          content: [...old.content, space].sort((a, b) =>
            a.name.localeCompare(b.name)
          ),
        };
      });
    },
    [queryClient, spacesKey]
  );

  const commit = useCallback(
    (space: Space) => {
      timersRef.current.delete(space.spaceId);
      deadlinesRef.current.delete(space.spaceId);
      pausedRef.current.delete(space.spaceId);

      toast.dismiss(undoToastId(space.spaceId));

      mutate(space.spaceId, {
        onError: (error) => {
          restoreToCache(space);
          errorToast({
            id: 'spaces-delete-error',
            title: 'Could not delete the space',
            error,
          });
        },
      });
    },
    [mutate, restoreToCache]
  );

  const schedule = useCallback(
    (space: Space, delay: number) => {
      deadlinesRef.current.set(space.spaceId, Date.now() + delay);
      timersRef.current.set(
        space.spaceId,
        setTimeout(() => {
          commit(space);
        }, delay)
      );
    },
    [commit]
  );

  const pause = useCallback((space: Space) => {
    const deadline = deadlinesRef.current.get(space.spaceId);
    if (deadline === undefined) return;

    const timer = timersRef.current.get(space.spaceId);
    if (timer !== undefined) clearTimeout(timer);
    timersRef.current.delete(space.spaceId);

    pausedRef.current.set(space.spaceId, Math.max(0, deadline - Date.now()));
  }, []);

  const resume = useCallback(
    (space: Space) => {
      const remaining = pausedRef.current.get(space.spaceId);
      if (remaining === undefined) return;

      pausedRef.current.delete(space.spaceId);
      schedule(space, remaining);
    },
    [schedule]
  );

  const restore = useCallback(
    (space: Space) => {
      const timer = timersRef.current.get(space.spaceId);
      if (timer !== undefined) clearTimeout(timer);
      timersRef.current.delete(space.spaceId);
      deadlinesRef.current.delete(space.spaceId);
      pausedRef.current.delete(space.spaceId);

      restoreToCache(space);
      onRestoreRef.current?.(space);
      toast.dismiss(undoToastId(space.spaceId));
    },
    [restoreToCache]
  );

  const requestDelete = useCallback(
    (space: Space) => {
      removeFromCache(space.spaceId);
      schedule(space, UNDO_WINDOW_MS);

      toast.custom(
        () => (
          <SpaceUndoToast
            space={space}
            duration={UNDO_WINDOW_MS}
            onRestore={restore}
            onPause={() => pause(space)}
            onResume={() => resume(space)}
          />
        ),
        {
          id: undoToastId(space.spaceId),
          duration: UNDO_WINDOW_MS,
          position: 'bottom-right',
          className: 'w-full',
        }
      );
    },
    [removeFromCache, schedule, restore, pause, resume]
  );

  return { requestDelete };
}
