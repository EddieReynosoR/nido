import type {
  CreateNoteRequest,
  MoveNoteRequest,
  MoveNoteResponse,
  Note,
  NoteContentResponse,
  RenameNoteRequest,
  RenameNoteResponse,
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

export function renameNote(
  noteId: string,
  request: RenameNoteRequest,
  accessToken: string
) {
  return executeFetch<RenameNoteResponse>(
    `${BASE_URL}/api/note/${encodeURIComponent(noteId)}/title`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(request),
    },
    'There was an error renaming the note.'
  );
}

export function moveNote(
  noteId: string,
  request: MoveNoteRequest,
  accessToken: string
) {
  return executeFetch<MoveNoteResponse>(
    `${BASE_URL}/api/note/${encodeURIComponent(noteId)}/move`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(request),
    },
    'There was an error moving the note.'
  );
}

export function deleteNote(noteId: string, accessToken: string) {
  return executeFetch<null>(
    `${BASE_URL}/api/note/${encodeURIComponent(noteId)}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    'There was an error deleting the note.'
  );
}
