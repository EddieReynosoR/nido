import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { Toaster } from 'sonner';
import { SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { NoteTabsProvider } from '@/context/NoteTabsContext';
import type { NoteTreeItem } from '@/types/note.types';
import type { Topic } from '@/types/topic.types';
import Sidebar from '@/test/TopicTreeSidebar';
import { SPACE_ID, server } from '@/test/topic-tree-mocks';

export function note(noteId: string, title: string, topicId: string | null) {
  return {
    noteId,
    title,
    spaceId: SPACE_ID,
    topicId,
    version: 1,
    updatedAt: '2026-11-01T00:00:00Z',
  } satisfies NoteTreeItem;
}

export function topic(topicId: string, name: string, notes: NoteTreeItem[]) {
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

export function resetServerContent() {
  server.content = {
    topics: [topic('topic-1', 'Biology', [])],
    notes: [note('note-root', 'Root note', null)],
  };
}

export function renderSidebar(initialPath = '/') {
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
                <Route path="/topics/:topicId" element={<Sidebar />} />
                <Route path="*" element={<Sidebar />} />
              </Routes>
              <Toaster />
            </NoteTabsProvider>
          </SidebarProvider>
        </TooltipProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}
