import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renameNote } from '@/api/note';
import { renderSidebar, resetServerContent } from '@/test/topic-tree-utils';
import { server } from '@/test/topic-tree-mocks';

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

type User = ReturnType<typeof userEvent.setup>;

async function openRenameDialog(user: User, noteTitle = 'Root note') {
  await user.click(
    await screen.findByRole('button', {
      name: `Note options for ${noteTitle}`,
    })
  );
  await user.click(screen.getByRole('menuitem', { name: 'Rename note' }));

  return screen.findByRole('dialog', { name: 'Rename note' });
}

async function renameTo(user: User, dialog: HTMLElement, newTitle: string) {
  const input = within(dialog).getByRole('textbox', { name: 'Title' });
  await user.clear(input);
  if (newTitle) await user.type(input, newTitle);
  await user.click(
    within(dialog).getByRole('button', { name: 'Save changes' })
  );
}

function mockRenameResponse(suffix = '') {
  vi.mocked(renameNote).mockImplementation(async (_noteId, request) => {
    const title = `${request.title}${suffix}`;
    server.content!.notes[0].title = title;
    return {
      title,
      version: request.version + 1,
      updatedAt: '2026-11-02T00:00:00Z',
    };
  });
}

describe('TopicTree note rename', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetServerContent();
  });

  it('the note menu offers "Rename note" and opens a dialog pre-filled with the current title', async () => {
    const user = userEvent.setup();
    renderSidebar();

    const dialog = await openRenameDialog(user);

    expect(within(dialog).getByRole('textbox', { name: 'Title' })).toHaveValue(
      'Root note'
    );
  });

  it('Save is disabled while the title is unchanged', async () => {
    const user = userEvent.setup();
    renderSidebar();

    const dialog = await openRenameDialog(user);

    const save = within(dialog).getByRole('button', { name: 'Save changes' });
    expect(save).toBeDisabled();

    await user.type(
      within(dialog).getByRole('textbox', { name: 'Title' }),
      ' 2'
    );
    expect(save).toBeEnabled();
  });

  it('renaming updates the title in the sidebar and on the open tab', async () => {
    mockRenameResponse();
    const user = userEvent.setup();
    renderSidebar('/notes/note-root');
    const tabs = await screen.findByRole('navigation', { name: 'Open notes' });
    expect(await within(tabs).findByText('Root note')).toBeInTheDocument();

    const dialog = await openRenameDialog(user);
    await renameTo(user, dialog, 'Lecture notes');

    expect(
      await screen.findByRole('button', {
        name: 'Note options for Lecture notes',
      })
    ).toBeInTheDocument();
    expect(within(tabs).getByText('Lecture notes')).toBeInTheDocument();
    expect(within(tabs).queryByText('Root note')).not.toBeInTheDocument();
    expect(renameNote).toHaveBeenCalledWith(
      'note-root',
      expect.objectContaining({ title: 'Lecture notes', topicId: null }),
      'token'
    );
  });

  it('when the server returns Title (2), the sidebar and tab show that', async () => {
    mockRenameResponse(' (2)');
    const user = userEvent.setup();
    renderSidebar('/notes/note-root');
    const tabs = await screen.findByRole('navigation', { name: 'Open notes' });
    expect(await within(tabs).findByText('Root note')).toBeInTheDocument();

    const dialog = await openRenameDialog(user);
    await renameTo(user, dialog, 'Lecture notes');

    expect(
      await screen.findByRole('button', {
        name: 'Note options for Lecture notes (2)',
      })
    ).toBeInTheDocument();
    expect(within(tabs).getByText('Lecture notes (2)')).toBeInTheDocument();
    expect(within(tabs).queryByText('Root note')).not.toBeInTheDocument();
  });

  it('an empty title shows a validation error and makes no request', async () => {
    const user = userEvent.setup();
    renderSidebar();

    const dialog = await openRenameDialog(user);
    await renameTo(user, dialog, '');

    expect(
      await within(dialog).findByText('Note title is required')
    ).toBeInTheDocument();
    expect(renameNote).not.toHaveBeenCalled();
    expect(
      screen.getByRole('button', {
        name: 'Note options for Root note',
        hidden: true,
      })
    ).toBeInTheDocument();
  });
});
