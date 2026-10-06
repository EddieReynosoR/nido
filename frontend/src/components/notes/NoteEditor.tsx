import type { PartialBlock } from '@blocknote/core';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
import '@blocknote/shadcn/style.css';
import { useTheme } from '@/hooks/use-theme';
import { useEffect, useRef, useState } from 'react';
import { useUpdateNoteContent } from '@/hooks/notes/use-note';
import { useAuth } from '@/context/AuthContext';
import type { UpdateNoteContentRequest } from '@/types/note.types';
import { cn } from '@/lib/utils';

function formatSavedAt(date: string) {
  return new Date(date).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function NoteEditor({
  initialContent,
  noteId,
  version,
  updatedAt,
}: {
  initialContent?: PartialBlock[];
  noteId: string | null;
  version: number;
  updatedAt?: string;
}) {
  const editor = useCreateBlockNote({ initialContent });
  const theme = useTheme();

  const { accessToken } = useAuth();
  const {
    mutate: update,
    isPending,
    isError,
  } = useUpdateNoteContent(accessToken);

  const [lastSavedAt, setLastSavedAt] = useState(updatedAt);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  const timeoutRef = useRef<number | null>(null);
  const updated = useRef(false);
  const versionRef = useRef(version);

  useEffect(() => {
    versionRef.current = version;
  }, [version]);

  useEffect(() => {
    if (!noteId) return;

    editor.onChange(() => {
      if (updated.current) return;

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setHasPendingChanges(true);

      timeoutRef.current = setTimeout(() => {
        const request: UpdateNoteContentRequest = {
          content: editor.document,
          version: versionRef.current,
        };

        updated.current = true;
        setHasPendingChanges(false);

        update(
          { noteId, ...request },
          {
            onSuccess: (response) => {
              setLastSavedAt(response.updatedAt);
            },
            onSettled: () => {
              updated.current = false;
            },
          }
        );
      }, 2000);
    });

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  let statusText = '';
  if (!noteId) statusText = 'Creating note…';
  else if (isPending) statusText = 'Saving…';
  else if (hasPendingChanges) statusText = 'Unsaved changes';
  else if (isError) statusText = "Couldn't save";
  else if (lastSavedAt) statusText = `Saved on ${formatSavedAt(lastSavedAt)}`;

  const showError =
    !!noteId && !isPending && !hasPendingChanges && isError;

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 -mt-10 mb-4 flex h-10 items-center justify-end border-b border-border bg-background/95 px-4 text-xs text-muted-foreground backdrop-blur">
        <span
          aria-live="polite"
          className={cn(showError && 'text-destructive')}
        >
          {statusText}
        </span>
      </div>
      <BlockNoteView
        editor={editor}
        theme={theme}
        className="mx-auto w-full wrap-anywhere"
      />
    </div>
  );
}
