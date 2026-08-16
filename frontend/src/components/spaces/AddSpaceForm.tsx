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
import { useCreateSpace } from '@/hooks/use-space';
import { useAuth } from '@/context/AuthContext';
import { errorToast } from '@/lib/toast';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useSpace } from '@/context/SpaceContext';

export default function AddSpaceForm({
  open,
  onOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const { accessToken } = useAuth();
  const { mutate, isPending } = useCreateSpace(accessToken);
  const { selectSpace } = useSpace();

  const form = useForm<AddSpaceSchema>({
    resolver: zodResolver(addSpaceSchema),
    defaultValues: {
      name: '',
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) form.reset();
    onOpenChange?.(nextOpen);
  };

  const onSubmit = (data: AddSpaceSchema) => {
    mutate(data.name, {
      onSuccess: (data) => {
        if (data) selectSpace(data);
        handleOpenChange(false);
        toast.success('Space created');
      },
      onError: (error) => {
        errorToast({
          id: 'spaces-fetch-error',
          error,
          title: 'Could not load your spaces',
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New space</DialogTitle>
          <DialogDescription>
            Spaces keep your folders and notes organized. Give this one a name.
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
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  {...field}
                  id="name"
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
            <Button disabled={isPending} type="submit">
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isPending ? 'Creating...' : 'Create space'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
