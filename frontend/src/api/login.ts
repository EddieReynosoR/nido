import type { LoginRequest } from '@/types/auth.types';

const BASE_URL = import.meta.env.VITE_API_URL;

export async function login(data: LoginRequest) {
  console.log(BASE_URL)
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(
      `There was an error during login. Response status: ${res.status}`
    );
  }
  return res.json();
}
