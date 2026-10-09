import type { PartialBlock } from '@blocknote/core';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
import '@blocknote/shadcn/style.css';
import { useTheme } from '@/hooks/use-theme';
import { useEffect, useRef, useState } from 'react';
import { useSaveNoteContent } from '@/hooks/notes/use-note';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import NoteTabs from '@/components/notes/NoteTabs';

function formatSavedAt(date: string) {
  return new Date(date).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function NoteEditor({
  initialContent,
  noteId,
  updatedAt,
}: {
  initialContent?: PartialBlock[];
  noteId: string | null;
  updatedAt?: string;
}) {
  const editor = useCreateBlockNote({ initialContent });
  const theme = useTheme();

  const { accessToken } = useAuth();
  const { save, isPending, isError } = useSaveNoteContent(accessToken);

  const [lastSavedAt, setLastSavedAt] = useState(updatedAt);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  const timeoutRef = useRef<number | null>(null);
  const dirtyRef = useRef(false);

  useEffect(() => {
    if (!noteId) return;

    const flush = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = null;

      if (!dirtyRef.current) return;
      dirtyRef.current = false;
      setHasPendingChanges(false);

      save(noteId, editor.document)
        .then((response) => setLastSavedAt(response.updatedAt))
        .catch(() => {});
    };

    const unsubscribe = editor.onChange(() => {
      dirtyRef.current = true;
      setHasPendingChanges(true);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(flush, 2000);
    });

    return () => {
      unsubscribe();
      flush();
    };
  }, [editor, noteId, save]);

  let statusText = '';
  if (!noteId) statusText = 'Creating note…';
  else if (isPending) statusText = 'Saving…';
  else if (hasPendingChanges) statusText = 'Unsaved changes';
  else if (isError) statusText = "Couldn't save";
  else if (lastSavedAt) statusText = `Saved on ${formatSavedAt(lastSavedAt)}`;

  const showError = !!noteId && !isPending && !hasPendingChanges && isError;

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 -mt-10 mb-4 flex h-10 items-center justify-between gap-2 border-b border-border bg-background/95 pr-4 text-xs text-muted-foreground backdrop-blur">
        <NoteTabs />
        <span
          aria-live="polite"
          className={cn(
            'shrink-0 whitespace-nowrap',
            showError && 'text-destructive'
          )}
        >
          {statusText}
        </span>
      </div>
      <BlockNoteView
        editor={editor}
        theme={theme}
        className="mx-auto w-full wrap-anywhere py-10 px-2"
      />
    </div>
  );
}
