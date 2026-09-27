import type { PartialBlock } from '@blocknote/core';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
import '@blocknote/shadcn/style.css';
import { useTheme } from '@/hooks/use-theme';

export default function NoteEditor({
  initialContent,
}: {
  initialContent?: PartialBlock[];
}) {
  const editor = useCreateBlockNote({ initialContent });
  const theme = useTheme();

  return (
    <BlockNoteView
      editor={editor}
      theme={theme}
      className="mx-auto w-full wrap-anywhere"
    />
  );
}
