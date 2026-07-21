import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { type TokenResponse } from '@/types/auth.types';
import { toast } from 'sonner';
import type { ErrorToastOptions } from '@/types/utils.types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getCookie = (name: string): string | undefined => {
  return document.cookie
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split('=')[1];
};

export function isValidTokenResponse(
  data: TokenResponse | null
): data is TokenResponse {
  if (
    !data ||
    typeof data.accessToken !== 'string' ||
    data.accessToken.trim() === ''
  ) {
    return false;
  }

  if (data.expiration) {
    const expirationDate = new Date(data.expiration);
    if (isNaN(expirationDate.getTime()) || expirationDate <= new Date()) {
      return false;
    }
  }

  return true;
}

export function isAuthenticated(): boolean {
  return localStorage.getItem('isAuthenticated') === 'true';
}

export class HttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function errorToast({
  error,
  title,
  customMessage,
}: ErrorToastOptions): void {
  console.log({ error, title, customMessage });
  if (error instanceof TypeError) {
    toast.error(title ?? 'Server cannot be reached', {
      description: [customMessage, error.message].filter(Boolean).join('\n '),
      position: 'bottom-right',
    });
    return;
  }

  if (error instanceof HttpError) {
    const isServerError = error instanceof HttpError && error.status >= 500;

    toast.error(title ?? (isServerError ? 'Server Error' : 'Request failed'), {
      description: [customMessage, error.message].filter(Boolean).join('\n '),
      position: 'bottom-right',
    });

    return;
  }

  toast.error(title ?? 'Error ocurred', {
    description: [customMessage, error.message].filter(Boolean).join('\n '),
    position: 'bottom-right',
  });
}
