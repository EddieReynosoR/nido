import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { addNoteSchema, type AddNoteSchema } from '@/lib/note-schema';
import { buildRootNoteRequest } from '@/lib/note';
import { useCreateNote } from '@/hooks/notes/use-note';
import { useAuth } from '@/context/AuthContext';
import { useSpace } from '@/context/SpaceContext';

type AddNoteFormProps = {
  onSuccess: () => void;
  onPendingChange?: (pending: boolean) => void;
};

export default function AddNoteForm({
  onSuccess,
  onPendingChange,
}: AddNoteFormProps) {
  const form = useForm<AddNoteSchema>({
    resolver: zodResolver(addNoteSchema),
    defaultValues: { title: '' },
  });

  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const { activeSpace } = useSpace();
  const { mutate: createNote, isPending } = useCreateNote(
    accessToken,
    activeSpace?.spaceId
  );

  useEffect(() => {
    onPendingChange?.(isPending);
  }, [isPending, onPendingChange]);

  const onSubmit = ({ title }: AddNoteSchema) => {
    if (!activeSpace) return;

    createNote(buildRootNoteRequest(activeSpace.spaceId, title), {
      onSuccess: (note) => {
        toast.success('Note created');
        onSuccess();
        navigate(`/notes/${note.noteId}`);
      },
    });
  };

  return (
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
            <FieldLabel htmlFor="note-title">Title</FieldLabel>
            <Input
              {...field}
              id="note-title"
              type="text"
              placeholder="e.g. Lecture notes"
              autoComplete="off"
              autoFocus
              maxLength={150}
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isPending}>
            Cancel
          </Button>
        </DialogClose>
        <Button disabled={isPending} type="submit">
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {isPending ? 'Creating...' : 'Create note'}
        </Button>
      </DialogFooter>
    </form>
  );
}
