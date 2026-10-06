import type {
  CreateNoteRequest,
  Note,
  NoteContentResponse,
  UpdateNoteContentRequest,
} from '@/types/note.types';
import { executeFetch, BASE_URL } from './auth';

export function createNote(request: CreateNoteRequest, accessToken: string) {
  return executeFetch<Note>(
    `${BASE_URL}/api/note/create`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(request),
    },
    'There was an error creating the note.'
  );
}

export function getNote(noteId: string, accessToken: string) {
  return executeFetch<Note>(
    `${BASE_URL}/api/note/${encodeURIComponent(noteId)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    'There was an error fetching the note.'
  );
}

export function updateNoteContent(
  noteId: string,
  request: UpdateNoteContentRequest,
  accessToken: string
) {
  return executeFetch<NoteContentResponse>(
    `${BASE_URL}/api/note/${encodeURIComponent(noteId)}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(request),
    },
    'There was an error saving the note.'
  );
}
