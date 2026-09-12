import { type ReparentRequest, type Topic } from '@/types/topic.types';
import { executeFetch, BASE_URL } from './auth';

export function getTopics(spaceId: string, accessToken: string) {
  return executeFetch<Topic[]>(
    `${BASE_URL}/api/topic?spaceId=${encodeURIComponent(spaceId)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    'There was an error fetching the topics of the respective space.'
  );
}

export function reparent(request: ReparentRequest, accessToken: string) {
  return executeFetch<null>(
    `${BASE_URL}/api/topic/reparent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(request),
    },
    'There was an error reparenting the current topic.'
  );
}
