import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import AddNoteForm from '@/components/notes/AddNoteForm';
import type { Topic } from '@/types/topic.types';

type AddNoteDialogProps = {
  topic: Topic | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function AddNoteDialog({
  topic,
  open,
  onOpenChange,
}: AddNoteDialogProps) {
  const [isPending, setIsPending] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isPending) return;
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New note</DialogTitle>
          <DialogDescription>
            {`Create a new note inside "${topic?.name ?? ''}".`}
          </DialogDescription>
        </DialogHeader>

        <AddNoteForm
          topic={topic}
          onSuccess={() => onOpenChange(false)}
          onPendingChange={setIsPending}
        />
      </DialogContent>
    </Dialog>
  );
}
