import type { LoginRequest } from '@/types/auth.types';

const BASE_URL = import.meta.env.VITE_API_URL;

export async function login(data: LoginRequest) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(`Login failed with status: ${res.status}`);
  }

  return res.json();
}

export async function csrf() {
  const res = await fetch(`${BASE_URL}/auth/csrf`, {
    method: 'GET',
    credentials: 'include',
  });

  if (res.ok) return;

  throw new Error(
    `There was an error getting the CSRF token. Response status: ${res.status}`
  );
}

export async function refresh(csrfToken: string) {
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'X-XSRF-TOKEN': csrfToken },
  });

  if (!res.ok) {
    throw new Error(
      `There was an error getting a new access token. Response status: ${res.status}`
    );
  }
  return res.json();
}
