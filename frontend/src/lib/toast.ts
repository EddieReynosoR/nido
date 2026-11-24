import { toast } from 'sonner';
import { type ErrorToastOptions } from '@/types/utils.types';
import { ApiError } from '@/lib/http';
import { ERROR_MESSAGES } from '@/lib/error-messages';

function defaultTitle(error?: Error): string {
  if (error instanceof TypeError) return 'Unable to reach the server';
  if (error instanceof ApiError) {
    return error.status >= 500 ? 'Server error' : 'Request failed';
  }
  return 'Something went wrong';
}

export function errorToast({
  error,
  title,
  customMessage,
  id,
}: ErrorToastOptions): void {
  const apiError = error instanceof ApiError ? error : undefined;
  const mapped = apiError ? ERROR_MESSAGES[apiError.code] : undefined;

  if (apiError?.code === 'no_session') {
    toast.error(mapped?.title, {
      id: 'invalid-session',
      description: mapped?.description,
      position: 'bottom-right',
    });
    return;
  }

  toast.error(title ?? mapped?.title ?? defaultTitle(error), {
    id,
    description:
      customMessage ??
      apiError?.description ??
      mapped?.description ??
      error?.message,
    position: 'bottom-right',
  });
}
