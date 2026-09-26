import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
import '@blocknote/shadcn/style.css';
import { useTheme } from '@/hooks/use-theme';

export default function NoteEditor() {
  const editor = useCreateBlockNote();
  const theme = useTheme();

  return (
    <BlockNoteView
      editor={editor}
      theme={theme}
      className="mx-auto w-full wrap-anywhere"
    />
  );
}
