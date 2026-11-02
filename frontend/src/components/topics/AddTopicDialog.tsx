import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import AddTopicForm from '@/components/topics/AddTopicForm';
import type { Topic } from '@/types/topic.types';

type AddTopicDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  parentTopic?: Topic | null;
};

export default function AddTopicDialog({
  open,
  onOpenChange,
  parentTopic,
}: AddTopicDialogProps) {
  const [isPending, setIsPending] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isPending) return;
    onOpenChange?.(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New folder</DialogTitle>
          <DialogDescription>
            {parentTopic
              ? `Create a new folder inside "${parentTopic.name}".`
              : 'Create a new top-level folder in this space.'}
          </DialogDescription>
        </DialogHeader>

        <AddTopicForm
          parentTopic={parentTopic}
          onSuccess={() => onOpenChange?.(false)}
          onPendingChange={setIsPending}
        />
      </DialogContent>
    </Dialog>
  );
}
