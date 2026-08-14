import { executeFetch, BASE_URL } from './auth';
import { type getSpaceResponse } from '@/types/space.types';

export function getSpaces(accessToken: string) {
  return executeFetch<getSpaceResponse>(
    `${BASE_URL}/api/space`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    'There was an error fetching your spaces.'
  );
}
