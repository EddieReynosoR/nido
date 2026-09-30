import { createNote, getNote } from '@/api/note';
import { HttpError } from '@/lib/http';
import { errorToast, invalidSessionToast } from '@/lib/toast';
import { setTopicNoteId } from '@/lib/topic-tree';
import type { CreateNoteRequest, Note } from '@/types/note.types';
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

  return useMutation<Note | null, HttpError, CreateNoteRequest>({
    mutationFn: async (request) => {
      if (!accessToken) throw new HttpError('NO_SESSION', 400);
      return createNote(request, accessToken);
    },
    onSuccess: (note) => {
      if (!note) return;

      queryClient.setQueryData(['note', note.noteId], note);
      queryClient.setQueryData<Topic[]>(['topics', spaceId], (old) =>
        old ? setTopicNoteId(old, note.topicId, note.noteId) : old
      );
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
