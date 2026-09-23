import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import type { Topic } from '@/types/topic.types';
import { useLastValue } from '@/hooks/use-last-value';

export default function DeleteTopicDialog({
  topic,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  topic: Topic | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm?: () => void;
  isPending?: boolean;
}) {
  const displayedTopic = useLastValue(topic);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{displayedTopic?.name}”?</AlertDialogTitle>
          <AlertDialogDescription>
            This will delete the folder and everything inside it, including its
            sub-folders. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => onConfirm?.()}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
