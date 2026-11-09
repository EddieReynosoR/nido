import { vi } from 'vitest';
import type { SpaceContent } from '@/types/space.types';
import type { Topic } from '@/types/topic.types';

export const SPACE_ID = 'space-1';

export const server = {
  content: null as SpaceContent | null,
};

export const authMock = () => ({
  useAuth: () => ({ accessToken: 'token' }),
});

export const spaceMock = () => ({
  useSpace: () => ({ activeSpace: { spaceId: SPACE_ID } }),
});

export const spaceApiMock = () => ({
  getSpaceContent: vi.fn(async () => structuredClone(server.content)),
});

export const noteApiMock = () => ({
  createNote: vi.fn(),
  getNote: vi.fn(),
  updateNoteContent: vi.fn(),
  renameNote: vi.fn(),
  deleteNote: vi.fn(async (noteId: string) => {
    if (!server.content) return null;
    const removeFrom = (topics: Topic[]) => {
      for (const topic of topics) {
        if (topic.noteId === noteId) topic.noteId = null;
        topic.notes = topic.notes.filter((note) => note.noteId !== noteId);
        removeFrom(topic.topics);
      }
    };
    server.content.notes = server.content.notes.filter(
      (note) => note.noteId !== noteId
    );
    removeFrom(server.content.topics);
    return null;
  }),
});
