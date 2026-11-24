import type { LoginRequest, TokenResponse } from '@/types/auth.types';
import { ApiError } from '@/lib/http';
import { hasProp } from '@/lib/auth';

export const BASE_URL = import.meta.env.VITE_API_URL;

export async function executeFetch<T>(
  url: string,
  props: RequestInit,
  errorMessage: string
): Promise<T | null> {
  const res = await fetch(url, props);

  if (!res.ok) {
    const data: unknown = await res.json().catch(() => null);

    throw new ApiError({
      status: res.status,
      code:
        hasProp(data, 'error') && typeof data.error === 'string'
          ? data.error
          : `http_${res.status}`,
      description:
        hasProp(data, 'error_description') &&
        typeof data.error_description === 'string'
          ? data.error_description
          : undefined,
      message: errorMessage,
    });
  }

  const text = await res.text();
  return text ? (JSON.parse(text) as T) : null;
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
