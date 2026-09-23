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
import { useUpdateTopic } from '@/hooks/use-topic';
import { useLastValue } from '@/hooks/use-last-value';
import { useAuth } from '@/context/AuthContext';
import type { Topic } from '@/types/topic.types';

type EditTopicDialogProps = {
  topic: Topic | null;
  spaceId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export default function EditTopicDialog({
  topic,
  spaceId,
  open,
  onOpenChange,
}: EditTopicDialogProps) {
  const displayedTopic = useLastValue(topic);

  const { accessToken } = useAuth();
  const { mutate: updateTopic, isPending } = useUpdateTopic(accessToken);

  const form = useForm<AddTopicSchema>({
    resolver: zodResolver(addTopicSchema),
    defaultValues: {
      name: topic?.name ?? '',
      color: topic?.color ?? DEFAULT_TOPIC_COLOR,
    },
  });

  const { reset } = form;

  useEffect(() => {
    if (topic) reset({ name: topic.name, color: topic.color });
  }, [topic, reset]);

  const name = form.watch('name');
  const color = form.watch('color');
  const isUnchanged =
    name.trim() === displayedTopic?.name && color === displayedTopic?.color;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isPending) return;
    onOpenChange?.(nextOpen);
  };

  const onSubmit = (data: AddTopicSchema) => {
    if (!topic) return;

    updateTopic(
      {
        topicId: topic.topicId,
        spaceId,
        name: data.name.trim(),
        color: data.color,
      },
      {
        onSuccess: () => {
          toast.success('Topic updated');
          onOpenChange?.(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit folder</DialogTitle>
          <DialogDescription>
            Rename “{displayedTopic?.name}” or pick a different color. Everything
            inside it stays where it is.
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
                <FieldLabel htmlFor="edit-topic-name">Name</FieldLabel>
                <Input
                  {...field}
                  id="edit-topic-name"
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
                <FieldLabel htmlFor="edit-topic-color">Color</FieldLabel>
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
                      id="edit-topic-color"
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
