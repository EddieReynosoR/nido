import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { DialogClose, DialogFooter } from '@/components/ui/dialog';
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
import { useCreate } from '@/hooks/topics/use-topic';
import { useAuth } from '@/context/AuthContext';
import { useSpace } from '@/context/SpaceContext';
import type { CreateTopicRequest, Topic } from '@/types/topic.types';

type AddTopicFormProps = {
  parentTopic?: Topic | null;
  onSuccess: () => void;
  onPendingChange?: (pending: boolean) => void;
};

export default function AddTopicForm({
  parentTopic,
  onSuccess,
  onPendingChange,
}: AddTopicFormProps) {
  const form = useForm<AddTopicSchema>({
    resolver: zodResolver(addTopicSchema),
    defaultValues: {
      name: '',
      color: DEFAULT_TOPIC_COLOR,
    },
  });

  const { accessToken } = useAuth();
  const { activeSpace } = useSpace();
  const { mutate: createTopic, isPending } = useCreate(accessToken);

  useEffect(() => {
    onPendingChange?.(isPending);
  }, [isPending, onPendingChange]);

  const onSubmit = (data: AddTopicSchema) => {
    if (!activeSpace) return;

    const request: CreateTopicRequest = {
      ...data,
      spaceId: activeSpace.spaceId,
      parentTopicId: parentTopic?.topicId ?? null,
    };

    createTopic(request, {
      onSuccess: () => {
        toast.success('Topic created');
        onSuccess();
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
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
          {isPending ? 'Creating...' : 'Create folder'}
        </Button>
      </DialogFooter>
    </form>
  );
}
