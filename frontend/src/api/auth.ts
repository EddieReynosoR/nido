import type { LoginRequest, TokenResponse } from '@/types/auth.types';
import { HttpError, TokenError } from '@/lib/http';
import { hasProp } from '@/lib/auth';
import { TOKEN_ERROR_CODES, type TokenErrorCode } from '@/lib/http';

export const BASE_URL = import.meta.env.VITE_API_URL;

export async function executeFetch<T>(
  url: string,
  props: RequestInit,
  errorMessage: string
): Promise<T | null> {
  try {
    const res = await fetch(url, props);

    if (!res.ok) {
      const data = await res.json().catch(() => null);

      if (
        res.status === 401 &&
        hasProp(data, 'error') &&
        TOKEN_ERROR_CODES.includes(data.error as TokenErrorCode)
      ) {
        throw new TokenError(data.error as TokenErrorCode);
      }

      throw new HttpError(
        `${errorMessage} Response status: ${res.status}`,
        res.status
      );
    }

    const text = await res.text();
    return text ? (JSON.parse(text) as T) : null;
  } catch (e) {
    if (e instanceof HttpError || e instanceof TokenError) {
      throw e;
    }

    if (e instanceof TypeError) {
      throw new TypeError(`Server cannot be fetched. ${e.message}.`);
    }

    const message = e instanceof Error ? e.message : String(e);
    throw new Error(`There was an error: ${message}`);
  }
}

export function login(data: LoginRequest) {
  return executeFetch<TokenResponse>(
    `${BASE_URL}/auth/login`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    },
    'Login failed.'
  );
}

export function csrf() {
  return executeFetch<null>(
    `${BASE_URL}/auth/csrf`,
    {
      method: 'GET',
      credentials: 'include',
    },
    'There was an error getting the CSRF token.'
  );
}

export function refresh(csrfToken: string) {
  return executeFetch<TokenResponse>(
    `${BASE_URL}/auth/refresh`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-XSRF-TOKEN': csrfToken },
    },
    'There was an error getting a new access token.'
  );
}

export function logout(csrfToken: string) {
  return executeFetch<null>(
    `${BASE_URL}/auth/logout`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-XSRF-TOKEN': csrfToken },
    },
    'There was an error logging out of the account.'
  );
}
