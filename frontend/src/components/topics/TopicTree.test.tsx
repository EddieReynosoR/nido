import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { deleteNote } from '@/api/note';
import NoteTabs from '@/components/notes/NoteTabs';
import TopicTree from '@/components/topics/TopicTree';
import { SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { NoteTabsProvider } from '@/context/NoteTabsContext';
import { useSpaceContent } from '@/hooks/spaces/use-space-content';
import type { NoteTreeItem } from '@/types/note.types';
import type { SpaceContent } from '@/types/space.types';
import type { Topic } from '@/types/topic.types';

const SPACE_ID = 'space-1';

const server = vi.hoisted(() => ({
  content: null as SpaceContent | null,
}));

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ accessToken: 'token' }),
}));

vi.mock('@/context/SpaceContext', () => ({
  useSpace: () => ({ activeSpace: { spaceId: 'space-1' } }),
}));

vi.mock('@/api/space', () => ({
  getSpaceContent: vi.fn(async () => structuredClone(server.content)),
}));

vi.mock('@/api/note', () => ({
  createNote: vi.fn(),
  getNote: vi.fn(),
  updateNoteContent: vi.fn(),
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
}));

function note(noteId: string, title: string, topicId: string | null) {
  return {
    noteId,
    title,
    spaceId: SPACE_ID,
    topicId,
    version: 1,
    updatedAt: '2026-11-01T00:00:00Z',
  } satisfies NoteTreeItem;
}

function topic(topicId: string, name: string, notes: NoteTreeItem[]) {
  return {
    topicId,
    name,
    color: '#888888',
    parentId: null,
    spaceId: SPACE_ID,
    deletedAt: null,
    topics: [],
    noteId: null,
    notes,
  } satisfies Topic;
}

function Sidebar() {
  const { data } = useSpaceContent(SPACE_ID, 'token');
  if (!data) return null;

  return (
    <>
      <NoteTabs />
      <TopicTree topics={data.topics} notes={data.notes} spaceId={SPACE_ID} />
    </>
  );
}

function renderSidebar(initialPath = '/') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <TooltipProvider>
          <SidebarProvider>
            <NoteTabsProvider spaceId={SPACE_ID}>
              <Routes>
                <Route path="/notes/:noteId" element={<Sidebar />} />
                <Route path="*" element={<Sidebar />} />
              </Routes>
            </NoteTabsProvider>
          </SidebarProvider>
        </TooltipProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('TopicTree note deletion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    server.content = {
      topics: [topic('topic-1', 'Biology', [])],
      notes: [note('note-root', 'Root note', null)],
    };
  });

  it('deleting a root note after confirming removes it from the sidebar', async () => {
    const user = userEvent.setup();
    renderSidebar();

    await user.click(
      await screen.findByRole('button', { name: 'Note options for Root note' })
    );
    await user.click(screen.getByRole('menuitem', { name: 'Delete note' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() =>
      expect(screen.queryByText('Root note')).not.toBeInTheDocument()
    );
  });

  it('deleting a note inside a topic after confirming removes it from that topic', async () => {
    server.content = {
      topics: [
        topic('topic-1', 'Biology', [
          note('note-nested', 'Cell structure', 'topic-1'),
        ]),
      ],
      notes: [],
    };
    const user = userEvent.setup();
    renderSidebar();

    await user.dblClick(await screen.findByText('Biology'));
    await user.click(
      await screen.findByRole('button', {
        name: 'Note options for Cell structure',
      })
    );
    await user.click(screen.getByRole('menuitem', { name: 'Delete note' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() =>
      expect(screen.queryByText('Cell structure')).not.toBeInTheDocument()
    );
    expect(screen.getByText('Biology')).toBeInTheDocument();
  });

  it('cancelling the delete dialog keeps the note', async () => {
    const user = userEvent.setup();
    renderSidebar();

    await user.click(
      await screen.findByRole('button', { name: 'Note options for Root note' })
    );
    await user.click(screen.getByRole('menuitem', { name: 'Delete note' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() =>
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    );
    expect(screen.getByText('Root note')).toBeInTheDocument();
    expect(deleteNote).not.toHaveBeenCalled();
  });

  it('deleting a note that is open in a tab closes that tab', async () => {
    const user = userEvent.setup();
    renderSidebar('/notes/note-root');

    const tabs = await screen.findByRole('navigation', { name: 'Open notes' });
    expect(await within(tabs).findByText('Root note')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Note options for Root note' })
    );
    await user.click(screen.getByRole('menuitem', { name: 'Delete note' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() =>
      expect(within(tabs).queryByText('Root note')).not.toBeInTheDocument()
    );
  });

  it("deleting a topic's intro note still works as before", async () => {
    server.content = {
      topics: [{ ...topic('topic-1', 'Biology', []), noteId: 'intro-1' }],
      notes: [],
    };
    const user = userEvent.setup();
    renderSidebar();

    await user.click(
      await screen.findByRole('button', { name: 'Folder options for Biology' })
    );
    await user.click(
      screen.getByRole('menuitem', { name: 'Delete intro note' })
    );
    expect(
      screen.getByText('Delete the intro note of “Biology”?')
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() =>
      expect(deleteNote).toHaveBeenCalledWith('intro-1', 'token')
    );
    await user.click(
      await screen.findByRole('button', { name: 'Folder options for Biology' })
    );
    await waitFor(() =>
      expect(
        screen.getByRole('menuitem', { name: 'Delete intro note' })
      ).toHaveAttribute('aria-disabled', 'true')
    );
  });

  it("deleting the note I'm viewing takes me to another open tab", async () => {
    server.content = {
      topics: [],
      notes: [note('note-a', 'Note A', null), note('note-b', 'Note B', null)],
    };
    localStorage.setItem(
      `nido:openTabs:${SPACE_ID}`,
      JSON.stringify([
        { type: 'note', id: 'note-a' },
        { type: 'note', id: 'note-b' },
      ])
    );
    const user = userEvent.setup();
    renderSidebar('/notes/note-a');

    const tabs = await screen.findByRole('navigation', { name: 'Open notes' });
    expect(
      await within(tabs).findByRole('link', { name: 'Note A' })
    ).toHaveAttribute('aria-current', 'page');

    await user.click(
      screen.getByRole('button', { name: 'Note options for Note A' })
    );
    await user.click(screen.getByRole('menuitem', { name: 'Delete note' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() =>
      expect(within(tabs).queryByText('Note A')).not.toBeInTheDocument()
    );
    expect(within(tabs).getByRole('link', { name: 'Note B' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });
});
