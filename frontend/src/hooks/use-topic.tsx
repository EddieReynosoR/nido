import { getTopics } from '@/api/topic';
import { useQuery } from '@tanstack/react-query';

export function useTopics(
  spaceId: string | undefined,
  accessToken: string | null
) {
  return useQuery({
    queryKey: ['topics', spaceId, accessToken],
    queryFn: () => getTopics(spaceId!, accessToken!),
    enabled: !!spaceId && !!accessToken,
    staleTime: 30000,
  });
}
