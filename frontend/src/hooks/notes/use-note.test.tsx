import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpError } from '@/lib/http';
import { errorToast } from '@/lib/toast';
import { moveNote, renameNote, updateNoteContent } from '@/api/note';
import {
  useRenameNote,
  useSaveNoteContent,
  useTopicNote,
} from '@/hooks/notes/use-note';
import type { Note } from '@/types/note.types';
import type { SpaceContent } from '@/types/space.types';

vi.mock('@/api/note', () => ({
  createNote: vi.fn(),
  deleteNote: vi.fn(),
  getNote: vi.fn(),
  moveNote: vi.fn(),
  renameNote: vi.fn(),
  updateNoteContent: vi.fn(),
}));

vi.mock('@/lib/toast', () => ({
  errorToast: vi.fn(),
  invalidSessionToast: vi.fn(),
}));

const NOTE_ID = 'note-1';
const SPACE_ID = 'space-1';
const TOPIC_ID = 'topic-1';

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
  queryClient.setQueryData<SpaceContent>(['content', SPACE_ID], {
    topics: [
      {
        topicId: TOPIC_ID,
        name: 'Topic',
        color: '#000000',
        parentId: null,
        spaceId: SPACE_ID,
        deletedAt: null,
        topics: [],
        noteId: null,
        notes: [],
      },
    ],
    notes: [
      {
        noteId: NOTE_ID,
        title: 'Old title',
        spaceId: SPACE_ID,
        topicId: null,
        version,
        updatedAt: '2026-11-01T00:00:00Z',
      },
    ],
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const hooks = renderHook(
    () => ({
      content: useSaveNoteContent('token'),
      rename: useRenameNote('token', SPACE_ID),
      move: useTopicNote('token', SPACE_ID),
    }),
    { wrapper }
  );

  return { ...hooks, queryClient };
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

  it('falls back to the version in the content tree when the note is not cached', async () => {
    vi.mocked(renameNote).mockResolvedValue({
      title: 'New title',
      version: 5,
      updatedAt: '2026-11-03T00:00:00Z',
    });
    const { result, queryClient } = renderHooks(4);
    queryClient.removeQueries({ queryKey: ['note', NOTE_ID] });

    await act(async () => {
      await result.current.rename.mutateAsync({
        noteId: NOTE_ID,
        title: 'New title',
        topicId: null,
      });
    });

    expect(renameNote).toHaveBeenCalledWith(
      NOTE_ID,
      { title: 'New title', version: 4, topicId: null },
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

describe('useTopicNote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("moves the note in ['content', spaceId] before the request finishes", async () => {
    let finishMove!: () => void;
    vi.mocked(moveNote).mockImplementation(
      () =>
        new Promise((resolve) => {
          finishMove = () => resolve({ title: 'Old title', version: 3 });
        })
    );
    const { result, queryClient } = renderHooks();

    act(() => {
      result.current.move.mutate({
        noteId: NOTE_ID,
        fromTopicId: null,
        topicId: TOPIC_ID,
      });
    });

    await waitFor(() => {
      const content = queryClient.getQueryData<SpaceContent>([
        'content',
        SPACE_ID,
      ]);
      expect(content?.notes).toEqual([]);
      expect(content?.topics[0].notes.map((note) => note.noteId)).toEqual([
        NOTE_ID,
      ]);
    });

    await act(async () => finishMove());
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
    vi.mocked(moveNote).mockResolvedValue({ title: 'Old title', version: 3 });
    const { result } = renderHooks();

    act(() => {
      void result.current.content.save(NOTE_ID, []);
    });
    await waitFor(() => expect(updateNoteContent).toHaveBeenCalledTimes(1));

    act(() => {
      result.current.move.mutate({
        noteId: NOTE_ID,
        fromTopicId: null,
        topicId: TOPIC_ID,
      });
    });
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(moveNote).not.toHaveBeenCalled();

    await act(async () => finishSave());

    await waitFor(() => expect(moveNote).toHaveBeenCalledTimes(1));
    expect(
      vi.mocked(updateNoteContent).mock.invocationCallOrder[0]
    ).toBeLessThan(vi.mocked(moveNote).mock.invocationCallOrder[0]);
  });

  it('on success, writes the returned title into the content cache, and the title, version and topicId into the note cache', async () => {
    vi.mocked(moveNote).mockResolvedValue({
      title: 'Old title (2)',
      version: 5,
    });
    const { result, queryClient } = renderHooks(1);

    await act(async () => {
      await result.current.move.mutateAsync({
        noteId: NOTE_ID,
        fromTopicId: null,
        topicId: TOPIC_ID,
      });
    });

    const content = queryClient.getQueryData<SpaceContent>([
      'content',
      SPACE_ID,
    ]);
    expect(content?.topics[0].notes[0].title).toBe('Old title (2)');
    expect(queryClient.getQueryData<Note>(['note', NOTE_ID])).toMatchObject({
      title: 'Old title (2)',
      version: 5,
      topicId: TOPIC_ID,
    });
  });

  it('on failure, restores the tree and shows an error toast', async () => {
    vi.mocked(moveNote).mockRejectedValue(new HttpError('Server error', 500));
    const { result, queryClient } = renderHooks();
    const before = queryClient.getQueryData<SpaceContent>([
      'content',
      SPACE_ID,
    ]);

    await act(async () => {
      await result.current.move
        .mutateAsync({
          noteId: NOTE_ID,
          fromTopicId: null,
          topicId: TOPIC_ID,
        })
        .catch(() => {});
    });

    expect(queryClient.getQueryData(['content', SPACE_ID])).toEqual(before);
    expect(errorToast).toHaveBeenCalledWith(
      expect.objectContaining({ id: `note-move-error-${NOTE_ID}` })
    );
  });
});
