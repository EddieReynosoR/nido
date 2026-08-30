import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Field, FieldError, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { addSpaceSchema, type AddSpaceSchema } from '@/lib/space-schema';
import { useEditSpace } from '@/hooks/use-space';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { HttpError } from '@/lib/http';
import { errorToast } from '@/lib/toast';
import type { Space } from '@/types/space.types';
import { useLastValue } from '@/hooks/use-last-value';

export default function EditSpaceDialog({
  space,
  open,
  onOpenChange,
}: {
  space: Space | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const displayedSpace = useLastValue(space);
  const { accessToken } = useAuth();
  const { mutate, isPending } = useEditSpace(accessToken);

  const form = useForm<AddSpaceSchema>({
    resolver: zodResolver(addSpaceSchema),
    defaultValues: {
      name: space?.name ?? '',
    },
  });

  const { reset } = form;

  useEffect(() => {
    if (space) reset({ name: space.name });
  }, [space, reset]);

  const name = form.watch('name');
  const isUnchanged = name.trim() === displayedSpace?.name;

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange?.(nextOpen);
  };

  const onSubmit = (data: AddSpaceSchema) => {
    if (!space) return;

    mutate(
      { spaceId: space.spaceId, name: data.name.trim() },
      {
        onSuccess: () => {
          handleOpenChange(false);
          toast.success('Space renamed');
        },
        onError: (error) => {
          errorToast({
            id: 'spaces-edit-error',
            title: 'Could not rename the space',
            error,
            customMessage:
              error instanceof HttpError && error.status == 409
                ? 'That space name is already in use.'
                : error.message,
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename space</DialogTitle>
          <DialogDescription>
            Pick a new name for “{displayedSpace?.name}”. Everything inside it
            stays where it is.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4"
        >
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="flex flex-col gap-2"
              >
                <FieldLabel htmlFor="edit-space-name">Name</FieldLabel>
                <Input
                  {...field}
                  id="edit-space-name"
                  type="text"
                  placeholder="e.g. Personal"
                  autoComplete="off"
                  autoFocus
                  maxLength={50}
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
              <Button type="button" variant="outline">
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
