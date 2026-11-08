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
import { useLastValue } from '@/hooks/use-last-value';

export default function DeleteNoteDialog({
  name,
  isIntro,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  name: string | null;
  isIntro: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm?: () => void;
  isPending?: boolean;
}) {
  const displayedName = useLastValue(name);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isIntro
              ? `Delete the intro note of “${displayedName}”?`
              : `Delete “${displayedName}”?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isIntro
              ? 'This will delete the intro note of this folder. Its sub-folders and their notes are not affected. This action cannot be undone.'
              : 'This will delete this note. This action cannot be undone.'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => onConfirm?.()}
            disabled={isPending}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
