import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renameNote, updateNoteContent } from '@/api/note';
import { useRenameNote, useSaveNoteContent } from '@/hooks/notes/use-note';
import type { Note } from '@/types/note.types';

vi.mock('@/api/note', () => ({
  createNote: vi.fn(),
  deleteNote: vi.fn(),
  getNote: vi.fn(),
  renameNote: vi.fn(),
  updateNoteContent: vi.fn(),
}));

const NOTE_ID = 'note-1';
const SPACE_ID = 'space-1';

function cachedNote(version: number) {
  return {
    noteId: NOTE_ID,
    title: 'Old title',
    content: [],
    spaceId: SPACE_ID,
    topicId: null,
    isIntro: false,
    version,
    updatedAt: '2026-11-01T00:00:00Z',
  } satisfies Note;
}

function renderHooks(version = 1) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  queryClient.setQueryData(['note', NOTE_ID], cachedNote(version));

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return renderHook(
    () => ({
      content: useSaveNoteContent('token'),
      rename: useRenameNote('token', SPACE_ID),
    }),
    { wrapper }
  );
}

describe('useRenameNote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('waits for a content save already queued for that note', async () => {
    let finishSave!: () => void;
    vi.mocked(updateNoteContent).mockImplementation(
      () =>
        new Promise((resolve) => {
          finishSave = () =>
            resolve({ version: 2, updatedAt: '2026-11-02T00:00:00Z' });
        })
    );
    vi.mocked(renameNote).mockResolvedValue({
      title: 'New title',
      version: 3,
      updatedAt: '2026-11-03T00:00:00Z',
    });
    const { result } = renderHooks();

    act(() => {
      void result.current.content.save(NOTE_ID, []);
    });
    await waitFor(() => expect(updateNoteContent).toHaveBeenCalledTimes(1));

    act(() => {
      result.current.rename.mutate({
        noteId: NOTE_ID,
        title: 'New title',
        topicId: null,
      });
    });
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(renameNote).not.toHaveBeenCalled();

    await act(async () => finishSave());

    await waitFor(() => expect(renameNote).toHaveBeenCalledTimes(1));
    expect(
      vi.mocked(updateNoteContent).mock.invocationCallOrder[0]
    ).toBeLessThan(vi.mocked(renameNote).mock.invocationCallOrder[0]);
  });

  it('sends the cached version, read when the request runs', async () => {
    let finishSave!: () => void;
    vi.mocked(updateNoteContent).mockImplementation(
      () =>
        new Promise((resolve) => {
          finishSave = () =>
            resolve({ version: 2, updatedAt: '2026-11-02T00:00:00Z' });
        })
    );
    vi.mocked(renameNote).mockResolvedValue({
      title: 'New title',
      version: 3,
      updatedAt: '2026-11-03T00:00:00Z',
    });
    const { result } = renderHooks(1);

    act(() => {
      void result.current.content.save(NOTE_ID, []);
    });
    await waitFor(() => expect(updateNoteContent).toHaveBeenCalledTimes(1));

    act(() => {
      result.current.rename.mutate({
        noteId: NOTE_ID,
        title: 'New title',
        topicId: null,
      });
    });
    await act(async () => finishSave());

    await waitFor(() => expect(renameNote).toHaveBeenCalledTimes(1));
    expect(renameNote).toHaveBeenCalledWith(
      NOTE_ID,
      { title: 'New title', version: 2, topicId: null },
      'token'
    );
  });

  it('after a rename, the next content save sends the version returned by the rename', async () => {
    vi.mocked(renameNote).mockResolvedValue({
      title: 'New title',
      version: 3,
      updatedAt: '2026-11-03T00:00:00Z',
    });
    vi.mocked(updateNoteContent).mockResolvedValue({
      version: 4,
      updatedAt: '2026-11-04T00:00:00Z',
    });
    const { result } = renderHooks(1);

    await act(async () => {
      await result.current.rename.mutateAsync({
        noteId: NOTE_ID,
        title: 'New title',
        topicId: null,
      });
    });
    await act(async () => {
      await result.current.content.save(NOTE_ID, []);
    });

    expect(updateNoteContent).toHaveBeenCalledWith(
      NOTE_ID,
      { content: [], version: 3 },
      'token'
    );
  });
});
