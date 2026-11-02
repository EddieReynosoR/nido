import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddTopicForm from '@/components/topics/AddTopicForm';
import AddNoteForm from '@/components/notes/AddNoteForm';

type ItemType = 'topic' | 'note';

const DESCRIPTIONS: Record<ItemType, string> = {
  topic: 'Create a new top-level folder in this space.',
  note: 'Create a new note at the root of this space.',
};

type AddRootItemDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function AddRootItemDialog({
  open,
  onOpenChange,
}: AddRootItemDialogProps) {
  const [type, setType] = useState<ItemType>('topic');
  const [isPending, setIsPending] = useState(false);

  const close = () => {
    setType('topic');
    onOpenChange(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) onOpenChange(true);
    else if (!isPending) close();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to space</DialogTitle>
          <DialogDescription>{DESCRIPTIONS[type]}</DialogDescription>
        </DialogHeader>

        <Tabs
          value={type}
          onValueChange={(value) => setType(value as ItemType)}
        >
          <TabsList className="w-full">
            <TabsTrigger value="topic" disabled={isPending}>
              Folder
            </TabsTrigger>
            <TabsTrigger value="note" disabled={isPending}>
              Note
            </TabsTrigger>
          </TabsList>

          <TabsContent value="topic">
            <AddTopicForm onSuccess={close} onPendingChange={setIsPending} />
          </TabsContent>
          <TabsContent value="note">
            <AddNoteForm onSuccess={close} onPendingChange={setIsPending} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
