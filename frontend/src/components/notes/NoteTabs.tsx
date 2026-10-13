import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useSpace } from '@/context/SpaceContext';
import { useNoteTabs } from '@/hooks/notes/use-note-tabs';
import { useTopics } from '@/hooks/topics/use-topic';
import { findTopicInTree } from '@/lib/topic-tree';
import { cn } from '@/lib/utils';
import type { Topic } from '@/types/topic.types';

export default function NoteTabs() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const { activeSpace } = useSpace();
  const { data: topics } = useTopics(activeSpace?.spaceId, accessToken);
  const { tabs, openTab, closeTab, retainTabs } = useNoteTabs();

  useEffect(() => {
    if (topicId) openTab(topicId);
  }, [topicId, openTab]);

  useEffect(() => {
    if (topics) retainTabs((id) => !!findTopicInTree(topics, id));
  }, [topics, retainTabs]);

  const openTopics = topics
    ? tabs
        .map((id) => findTopicInTree(topics, id))
        .filter((topic): topic is Topic => !!topic)
    : [];

  const handleClose = (id: string) => {
    const next = closeTab(id);
    if (id !== topicId) return;

    navigate(next ? `/topics/${next}` : '/');
  };

  return (
    <nav
      aria-label="Open notes"
      className="flex h-full min-w-0 flex-1 items-stretch overflow-x-auto"
    >
      {openTopics.map((topic) => {
        const isActive = topic.topicId === topicId;

        return (
          <div
            key={topic.topicId}
            onMouseDown={(e) => {
              if (e.button === 1) e.preventDefault();
            }}
            onAuxClick={(e) => {
              if (e.button !== 1) return;
              e.preventDefault();
              handleClose(topic.topicId);
            }}
            className={cn(
              'group/tab relative flex max-w-48 shrink-0 items-center gap-1 border-r border-b-2 border-r-border border-b-transparent pr-1 pl-3 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground',
              isActive && 'border-b-primary bg-muted/50 text-foreground'
            )}
          >
            <Link
              to={`/topics/${topic.topicId}`}
              aria-current={isActive ? 'page' : undefined}
              className="flex min-w-0 flex-1 items-center gap-2 outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-inset"
            >
              <span
                aria-hidden
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: topic.color }}
              />
              <span className="truncate">{topic.name}</span>
            </Link>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={`Close ${topic.name}`}
              onClick={() => handleClose(topic.topicId)}
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
