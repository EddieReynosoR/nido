import { type ReactNode } from 'react';
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
  DialogTrigger,
} from './ui/dialog';
import { Field, FieldError, FieldLabel } from './ui/field';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { addSpaceSchema, type AddSpaceSchema } from '@/lib/space-schema';

export default function AddSpaceForm({
  children,
  open,
  onOpenChange,
}: {
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const form = useForm<AddSpaceSchema>({
    resolver: zodResolver(addSpaceSchema),
    defaultValues: {
      name: '',
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange?.(nextOpen);
    if (!nextOpen) form.reset();
  };

  const onSubmit = (data: AddSpaceSchema) => {
    // TODO: create the space via the API, then close the dialog
    console.log(data);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}

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
            <Button type="submit">Create space</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
