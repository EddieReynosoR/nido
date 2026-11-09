import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { deleteNote } from '@/api/note';
import { HttpError } from '@/lib/http';
import { isNoteDiscarded } from '@/lib/note-save-queue';
import {
  note,
  renderSidebar,
  resetServerContent,
  topic,
} from '@/test/topic-tree-utils';
import { SPACE_ID, server } from '@/test/topic-tree-mocks';

vi.mock('@/context/AuthContext', async () =>
  (await import('@/test/topic-tree-mocks')).authMock()
);

vi.mock('@/context/SpaceContext', async () =>
  (await import('@/test/topic-tree-mocks')).spaceMock()
);

vi.mock('@/api/space', async () =>
  (await import('@/test/topic-tree-mocks')).spaceApiMock()
);

vi.mock('@/api/note', async () =>
  (await import('@/test/topic-tree-mocks')).noteApiMock()
);

describe('TopicTree note deletion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetServerContent();
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
    expect(
      screen.getByRole('button', { name: 'Folder options for Biology' })
    ).toBeInTheDocument();
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

  it("deleting the only open note I'm viewing takes me home", async () => {
    const user = userEvent.setup();
    renderSidebar('/notes/note-root');

    expect(await screen.findByTestId('location')).toHaveTextContent(
      '/notes/note-root'
    );

    await user.click(
      await screen.findByRole('button', { name: 'Note options for Root note' })
    );
    await user.click(screen.getByRole('menuitem', { name: 'Delete note' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/)
    );
  });

  it("deleting the intro note I'm viewing takes me to another open tab", async () => {
    server.content = {
      topics: [{ ...topic('topic-1', 'Biology', []), noteId: 'intro-1' }],
      notes: [note('note-b', 'Note B', null)],
    };
    localStorage.setItem(
      `nido:openTabs:${SPACE_ID}`,
      JSON.stringify([
        { type: 'topic', id: 'topic-1' },
        { type: 'note', id: 'note-b' },
      ])
    );
    const user = userEvent.setup();
    renderSidebar('/topics/topic-1');

    const tabs = await screen.findByRole('navigation', { name: 'Open notes' });
    expect(
      await within(tabs).findByRole('link', { name: 'Biology' })
    ).toHaveAttribute('aria-current', 'page');

    await user.click(
      screen.getByRole('button', { name: 'Folder options for Biology' })
    );
    await user.click(
      screen.getByRole('menuitem', { name: 'Delete intro note' })
    );
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent('/notes/note-b')
    );
    expect(within(tabs).queryByText('Biology')).not.toBeInTheDocument();
  });

  it("deleting the only open intro note I'm viewing takes me home", async () => {
    server.content = {
      topics: [{ ...topic('topic-1', 'Biology', []), noteId: 'intro-1' }],
      notes: [],
    };
    const user = userEvent.setup();
    renderSidebar('/topics/topic-1');

    expect(await screen.findByTestId('location')).toHaveTextContent(
      '/topics/topic-1'
    );

    await user.click(
      await screen.findByRole('button', { name: 'Folder options for Biology' })
    );
    await user.click(
      screen.getByRole('menuitem', { name: 'Delete intro note' })
    );
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/)
    );
  });

  it('removes the note from the sidebar before the server responds', async () => {
    let resolveDelete: (value: null) => void = () => {};
    vi.mocked(deleteNote).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveDelete = resolve;
        })
    );
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
    expect(deleteNote).toHaveBeenCalledWith('note-root', 'token');

    server.content!.notes = [];
    resolveDelete(null);
  });

  it('brings the note back when the delete fails', async () => {
    let rejectDelete: (error: Error) => void = () => {};
    vi.mocked(deleteNote).mockImplementationOnce(
      () =>
        new Promise((_resolve, reject) => {
          rejectDelete = reject;
        })
    );
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

    expect(isNoteDiscarded('note-root')).toBe(true);

    rejectDelete(new HttpError('Server error', 500));

    expect(await screen.findByText('Root note')).toBeInTheDocument();
    expect(
      await screen.findByText('Could not delete the note')
    ).toBeInTheDocument();
    expect(isNoteDiscarded('note-root')).toBe(false);
  });
});
