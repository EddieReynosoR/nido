import type { CreateNoteRequest, Note } from '@/types/note.types';
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
