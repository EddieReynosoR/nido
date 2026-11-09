import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { addNoteSchema, type AddNoteSchema } from '@/lib/note-schema';
import { useRenameNote } from '@/hooks/notes/use-note';
import { useLastValue } from '@/hooks/use-last-value';
import { useAuth } from '@/context/AuthContext';
import type { NoteTreeItem } from '@/types/note.types';

type EditNoteDialogProps = {
  note: NoteTreeItem | null;
  spaceId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export default function EditNoteDialog({
  note,
  spaceId,
  open,
  onOpenChange,
}: EditNoteDialogProps) {
  const displayedNote = useLastValue(note);

  const { accessToken } = useAuth();
  const { mutate: renameNote, isPending } = useRenameNote(accessToken, spaceId);

  const form = useForm<AddNoteSchema>({
    resolver: zodResolver(addNoteSchema),
    defaultValues: { title: note?.title ?? '' },
  });

  const { reset } = form;

  useEffect(() => {
    if (note) reset({ title: note.title });
  }, [note, reset]);

  const title = form.watch('title');
  const isUnchanged = title.trim() === displayedNote?.title;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isPending) return;
    onOpenChange?.(nextOpen);
  };

  const onSubmit = (data: AddNoteSchema) => {
    if (!note) return;

    renameNote(
      { noteId: note.noteId, title: data.title, topicId: note.topicId },
      {
        onSuccess: () => {
          toast.success('Note renamed');
          onOpenChange?.(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename note</DialogTitle>
          <DialogDescription>
            Pick a new title for “{displayedNote?.title}”. Its content stays as
            it is.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4"
        >
          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="flex flex-col gap-2"
              >
                <FieldLabel htmlFor="edit-note-title">Title</FieldLabel>
                <Input
                  {...field}
                  id="edit-note-title"
                  type="text"
                  placeholder="e.g. Linear algebra"
                  autoComplete="off"
                  autoFocus
                  maxLength={150}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button disabled={isPending || isUnchanged} type="submit">
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
