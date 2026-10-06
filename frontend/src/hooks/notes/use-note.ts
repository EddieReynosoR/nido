import { createNote, getNote, updateNoteContent } from '@/api/note';
import { HttpError } from '@/lib/http';
import { errorToast, invalidSessionToast } from '@/lib/toast';
import { setTopicNoteId } from '@/lib/topic-tree';
import type {
  CreateNoteRequest,
  Note,
  NoteContentResponse,
  UpdateNoteContentRequest,
} from '@/types/note.types';
import type { Topic } from '@/types/topic.types';
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
      queryClient.setQueryData<Topic[]>(['topics', spaceId], (old) =>
        old ? setTopicNoteId(old, note.topicId, note.noteId) : old
      );
    },
    onError: (error, request) => {
      if (error.message === 'NO_SESSION') invalidSessionToast();
      else {
        queryClient.invalidateQueries({ queryKey: ['topics', spaceId] });
        errorToast({
          id: `note-create-error-${request.topicId}`,
          error,
          title: 'Could not create the note',
        });
      }
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
    onSuccess: (response, { noteId, content }) => {
      queryClient.setQueryData<Note>(['note', noteId], (old) =>
        old ? { ...old, content, ...response } : old
      );
    },
    onError: (error, { noteId }) => {
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
