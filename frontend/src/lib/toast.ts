import { toast } from 'sonner';
import { type ErrorToastOptions } from '@/types/utils.types';
import { HttpError } from './http';

export function errorToast({
  error,
  title,
  customMessage,
}: ErrorToastOptions): void {
  if (error instanceof TypeError) {
    toast.error(title ?? 'Unable to reach the server', {
      description: [customMessage, error.message].filter(Boolean).join('\n '),
      position: 'bottom-right',
    });
    return;
  }

  if (error instanceof HttpError) {
    const isServerError = error.status >= 500;

    toast.error(title ?? (isServerError ? 'Server Error' : 'Request failed'), {
      description: [customMessage, error.message].filter(Boolean).join('\n '),
      position: 'bottom-right',
    });

    return;
  }

  toast.error(title ?? 'Error occurred.', {
    description: [customMessage, error.message].filter(Boolean).join('\n '),
    position: 'bottom-right',
  });
}
