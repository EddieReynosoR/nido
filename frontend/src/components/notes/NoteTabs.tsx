import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { FileText, Folder, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useSpace } from '@/context/SpaceContext';
import { useNoteTabs } from '@/hooks/notes/use-note-tabs';
import { useSpaceContent } from '@/hooks/spaces/use-space-content';
import { isSameTab, tabPath } from '@/lib/note-tabs';
import { findNoteInContent, findTopicInTree } from '@/lib/topic-tree';
import { cn } from '@/lib/utils';
import type { NoteTab } from '@/types/note.types';
import type { SpaceContent } from '@/types/space.types';

type ResolvedTab = {
  tab: NoteTab;
  label: string;
  color: string | null;
};

function resolveTab(content: SpaceContent, tab: NoteTab): ResolvedTab | null {
  if (tab.type === 'topic') {
    const topic = findTopicInTree(content.topics, tab.id);
    return topic ? { tab, label: topic.name, color: topic.color } : null;
  }

  const note = findNoteInContent(content, tab.id);
  return note ? { tab, label: note.title, color: null } : null;
}

export default function NoteTabs() {
  const { topicId, noteId } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const { activeSpace } = useSpace();
  const { data: content } = useSpaceContent(activeSpace?.spaceId, accessToken);
  const { tabs, openTab, closeTab, retainTabs } = useNoteTabs();

  const activeTab: NoteTab | null = topicId
    ? { type: 'topic', id: topicId }
    : noteId
      ? { type: 'note', id: noteId }
      : null;

  useEffect(() => {
    if (topicId) openTab({ type: 'topic', id: topicId });
    else if (noteId) openTab({ type: 'note', id: noteId });
  }, [topicId, noteId, openTab]);

  useEffect(() => {
    if (content) retainTabs((tab) => !!resolveTab(content, tab));
  }, [content, retainTabs]);

  const openTabs = content
    ? tabs
        .map((tab) => resolveTab(content, tab))
        .filter((tab): tab is ResolvedTab => !!tab)
    : [];

  const handleClose = (tab: NoteTab) => {
    const next = closeTab(tab);
    if (!activeTab || !isSameTab(tab, activeTab)) return;

    navigate(next ? tabPath(next) : '/');
  };

  return (
    <nav
      aria-label="Open notes"
      className="flex h-full min-w-0 flex-1 items-stretch overflow-x-auto"
    >
      {openTabs.map(({ tab, label, color }) => {
        const isActive = !!activeTab && isSameTab(tab, activeTab);
        const Icon = tab.type === 'topic' ? Folder : FileText;

        return (
          <div
            key={`${tab.type}-${tab.id}`}
            onMouseDown={(e) => {
              if (e.button === 1) e.preventDefault();
            }}
            onAuxClick={(e) => {
              if (e.button !== 1) return;
              e.preventDefault();
              handleClose(tab);
            }}
            className={cn(
              'group/tab relative flex max-w-48 shrink-0 items-center gap-1 border-r border-b-2 border-r-border border-b-transparent pr-1 pl-3 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground',
              isActive && 'border-b-primary bg-muted/50 text-foreground'
            )}
          >
            <Link
              to={tabPath(tab)}
              aria-current={isActive ? 'page' : undefined}
              className="flex min-w-0 flex-1 items-center gap-2 outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-inset"
            >
              <Icon
                aria-hidden
                className={cn(
                  'size-3.5 shrink-0',
                  !color && 'text-muted-foreground'
                )}
                style={color ? { color: `#${color}` } : undefined}
              />
              <span className="truncate">{label}</span>
            </Link>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={`Close ${label}`}
              onClick={() => handleClose(tab)}
              className={cn(
                'relative z-10 md:opacity-0 group-hover/tab:opacity-100 focus-visible:opacity-100',
                isActive && 'md:opacity-100'
              )}
            >
              <X />
            </Button>
          </div>
        );
      })}
    </nav>
  );
}
