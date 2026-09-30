import { createNote } from '@/api/note';
import { HttpError } from '@/lib/http';
import { errorToast, invalidSessionToast } from '@/lib/toast';
import type { CreateNoteRequest, Note } from '@/types/note.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateNote(
  accessToken: string | null,
  spaceId: string | undefined
) {
  const queryClient = useQueryClient();

  return useMutation<Note | null, HttpError, CreateNoteRequest>({
    mutationFn: async (request) => {
      if (!accessToken) throw new HttpError('NO_SESSION', 400);
      return createNote(request, accessToken);
    },
    onError: (error, request) => {
      if (error.message === 'NO_SESSION') invalidSessionToast();
      else {
        errorToast({
          id: `note-create-error-${request.topicId}`,
          error,
          title: 'Could not create the note',
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['topics', spaceId] });
    },
  });
}
