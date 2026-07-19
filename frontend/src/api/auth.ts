import type { LoginRequest, TokenResponse } from '@/types/auth.types';

const BASE_URL = import.meta.env.VITE_API_URL;

export async function executeFetch<T>(
  url: string,
  props: RequestInit,
  errorMessage: string
): Promise<T | null> {
  try {
    const res = await fetch(url, props);

    if (!res.ok) {
      throw new Error(`${errorMessage} Response status: ${res.status}`);
    }

    const text = await res.text();
    return text ? (JSON.parse(text) as T) : null;
  } catch (e) {
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

export async function csrf() {
  return executeFetch<null>(
    `${BASE_URL}/auth/csrf`,
    {
      method: 'GET',
      credentials: 'include',
    },
    'There was an error getting the CSRF token.'
  );
}

export async function refresh(csrfToken: string) {
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

export async function logout(csrfToken: string) {
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
