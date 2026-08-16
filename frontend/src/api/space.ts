import { executeFetch, BASE_URL } from './auth';
import type { getSpaceResponse, Space } from '@/types/space.types';

export function getSpaces(accessToken: string) {
  return executeFetch<getSpaceResponse>(
    `${BASE_URL}/api/space`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    'There was an error fetching your spaces.'
  );
}

export function addSpace(name: string, accessToken: string) {
  return executeFetch<Space>(
    `${BASE_URL}/api/space/create`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ name }),
    },
    'There was an error adding the new space.'
  );
}
