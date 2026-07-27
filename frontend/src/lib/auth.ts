import { type TokenResponse } from '@/types/auth.types';

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

export const getCookie = (name: string): string | undefined => {
  return document.cookie
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split('=')[1];
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem('isAuthenticated') === 'true';
};

export function hasProp<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return typeof obj === 'object' && obj !== null && key in obj;
}
