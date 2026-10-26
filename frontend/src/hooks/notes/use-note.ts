import { useCallback } from 'react';
import type { PartialBlock } from '@blocknote/core';
import { createNote, deleteNote, getNote, updateNoteContent } from '@/api/note';
import { HttpError } from '@/lib/http';
import {
  discardNoteSaves,
  enqueueNoteSave,
  isNoteDiscarded,
  restoreNoteSaves,
} from '@/lib/note-save-queue';
import { errorToast, invalidSessionToast } from '@/lib/toast';
import { spaceContentKey } from '@/hooks/spaces/use-space-content';
import { mapTopicsInContent, setTopicNoteId } from '@/lib/topic-tree';
import type {
  CreateNoteRequest,
  Note,
  NoteContentResponse,
  UpdateNoteContentRequest,
} from '@/types/note.types';
import type { SpaceContent } from '@/types/space.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useNote(
  noteId: string | null | undefined,
  accessToken: string | null
) {
  return useQuery({
    queryKey: ['note', noteId],
    queryFn: () => getNote(noteId!, accessToken!),
    enabled: !!noteId && !!accessToken,
  });
}

export function useCreateNote(
  accessToken: string | null,
  spaceId: string | undefined
) {
  const queryClient = useQueryClient();

  return useMutation<Note, HttpError, CreateNoteRequest>({
    mutationFn: async (request) => {
      if (!accessToken) throw new HttpError('NO_SESSION', 400);

      const note = await createNote(request, accessToken);
      if (!note) {
        throw new HttpError('The server did not return the created note.', 500);
      }

      return note;
    },
    onSuccess: (note) => {
      queryClient.setQueryData(['note', note.noteId], note);
      const { topicId } = note;
      if (!topicId) return;

      queryClient.setQueryData<SpaceContent | null>(
        spaceContentKey(spaceId),
        (old) =>
          mapTopicsInContent(old, (topics) =>
            setTopicNoteId(topics, topicId, note.noteId)
          )
      );
    },
    onError: (error, request) => {
      if (error.message === 'NO_SESSION') invalidSessionToast();
      else {
        queryClient.invalidateQueries({ queryKey: spaceContentKey(spaceId) });
        errorToast({
          id: `note-create-error-${request.topicId}`,
          error,
          title: 'Could not create the note',
        });
      }
    },
  });
}

export function useDeleteNote(
  accessToken: string | null,
  spaceId: string | undefined
) {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    HttpError,
    { noteId: string; topicId: string },
    { previous?: SpaceContent | null }
  >({
    mutationFn: async ({ noteId }) => {
      if (!accessToken) throw new HttpError('NO_SESSION', 400);
      // Runs after any save already queued for this note, so a PATCH can
      // never land after the DELETE.
      await enqueueNoteSave(noteId, () => deleteNote(noteId, accessToken));
    },
    onMutate: async ({ noteId, topicId }) => {
      // Must happen before the optimistic update unmounts the editor, whose
      // unmount flush would otherwise save the note being deleted.
      discardNoteSaves(noteId);

      const queryKey = spaceContentKey(spaceId);
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<SpaceContent | null>(queryKey);

      queryClient.setQueryData<SpaceContent | null>(queryKey, (old) =>
        mapTopicsInContent(old, (topics) =>
          setTopicNoteId(topics, topicId, null)
        )
      );

      return { previous };
    },
    onSuccess: (_data, { noteId }) => {
      queryClient.removeQueries({ queryKey: ['note', noteId] });
    },
    onError: (error, { noteId }, context) => {
      restoreNoteSaves(noteId);

      if (context?.previous) {
        queryClient.setQueryData(spaceContentKey(spaceId), context.previous);
      }

      if (error.message === 'NO_SESSION') invalidSessionToast();
      else
        errorToast({
          id: `note-delete-error-${noteId}`,
          error,
          title: 'Could not delete the note',
        });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: spaceContentKey(spaceId) });
    },
  });
}

export function useUpdateNoteContent(accessToken: string | null) {
  const queryClient = useQueryClient();

  return useMutation<
    NoteContentResponse,
    HttpError,
    UpdateNoteContentRequest & { noteId: string }
  >({
    mutationFn: async ({ noteId, ...request }) => {
      if (!accessToken) throw new HttpError('NO_SESSION', 400);

      const response = await updateNoteContent(noteId, request, accessToken);
      if (!response) {
        throw new HttpError('The server did not return the saved note.', 500);
      }

      return response;
    },
    onSuccess: (response, { noteId }) => {
      queryClient.setQueryData<Note>(['note', noteId], (old) =>
        old ? { ...old, ...response } : old
      );
    },
    onError: (error, { noteId }) => {
      queryClient.invalidateQueries({ queryKey: ['note', noteId] });
      if (error.message === 'NO_SESSION') invalidSessionToast();
      else
        errorToast({
          id: `note-update-error-${noteId}`,
          error,
          title: 'Could not save the note',
        });
    },
  });
}

export function useSaveNoteContent(accessToken: string | null) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, isError } = useUpdateNoteContent(accessToken);

  const save = useCallback(
    (noteId: string, content: PartialBlock[]) => {
      if (isNoteDiscarded(noteId)) {
        return Promise.reject(new Error('NOTE_DISCARDED'));
      }

      queryClient.setQueryData<Note>(['note', noteId], (old) =>
        old ? { ...old, content } : old
      );

      return enqueueNoteSave(noteId, () => {
        // The note may have been deleted while this save waited in the queue.
        if (isNoteDiscarded(noteId)) {
          return Promise.reject(new Error('NOTE_DISCARDED'));
        }

        const version =
          queryClient.getQueryData<Note>(['note', noteId])?.version ?? 0;

        return mutateAsync({ noteId, content, version });
      });
    },
    [queryClient, mutateAsync]
  );

  return { save, isPending, isError };
}
