import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { type TokenResponse } from '@/types/auth.types';

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

export function isValidTokenResponse(data: TokenResponse | null) {
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
