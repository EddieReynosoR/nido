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
} from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import { Button } from '@/components/ui/button';
import {
  addTopicSchema,
  DEFAULT_TOPIC_COLOR,
  HEX_COLOR_REGEX,
  type AddTopicSchema,
} from '@/lib/topic-schema';
import { useCreate } from '@/hooks/use-topic';
import { useAuth } from '@/context/AuthContext';
import type { CreateTopicRequest } from '@/types/topic.types';
import { useSpace } from '@/context/SpaceContext';
import { toast } from 'sonner';

export default function AddTopicDialog({
  open,
  onOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const form = useForm<AddTopicSchema>({
    resolver: zodResolver(addTopicSchema),
    defaultValues: {
      name: '',
      color: DEFAULT_TOPIC_COLOR,
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) form.reset();
    onOpenChange?.(nextOpen);
  };

  const { accessToken } = useAuth();
  const { activeSpace } = useSpace();
  const { mutate: createTopic } = useCreate(accessToken);

  const onSubmit = (data: { name: string; color: string }) => {
    if (!activeSpace) return;

    const request: CreateTopicRequest = {
      ...data,
      spaceId: activeSpace.spaceId,
      parentTopicId: null,
    };
    createTopic(request, {
      onSuccess: () => {
        toast.success('Topic created');
      },
    });

    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New folder</DialogTitle>
          <DialogDescription>
            Create a new top-level folder in this space.
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
                <FieldLabel htmlFor="topic-name">Name</FieldLabel>
                <Input
                  {...field}
                  id="topic-name"
                  type="text"
                  placeholder="e.g. Projects"
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

          <Controller
            name="color"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="flex flex-col gap-2"
              >
                <FieldLabel htmlFor="topic-color">Color</FieldLabel>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    aria-label="Pick folder color"
                    value={
                      HEX_COLOR_REGEX.test(field.value)
                        ? `#${field.value}`
                        : `#${DEFAULT_TOPIC_COLOR}`
                    }
                    onChange={(e) =>
                      field.onChange(e.target.value.slice(1).toUpperCase())
                    }
                    className="size-8 shrink-0 cursor-pointer rounded-lg border border-input bg-transparent p-0.5"
                  />
                  <InputGroup>
                    <InputGroupAddon>
                      <InputGroupText>#</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      id="topic-color"
                      name={field.name}
                      ref={field.ref}
                      value={field.value}
                      onBlur={field.onBlur}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value
                            .replace(/[^0-9A-Fa-f]/g, '')
                            .slice(0, 6)
                            .toUpperCase()
                        )
                      }
                      autoComplete="off"
                      spellCheck={false}
                      aria-invalid={fieldState.invalid}
                      className="font-mono uppercase"
                    />
                  </InputGroup>
                </div>
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
            <Button type="submit">Create folder</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
