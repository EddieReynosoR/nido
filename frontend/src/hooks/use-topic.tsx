import { getTopics, reparent } from '@/api/topic';
import type { ReparentRequest } from '@/types/topic.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useTopics(
  spaceId: string | undefined,
  accessToken: string | null
) {
  return useQuery({
    queryKey: ['topics', spaceId],
    queryFn: () => getTopics(spaceId!, accessToken!),
    enabled: !!spaceId && !!accessToken,
    staleTime: 30000,
  });
}

export function useReparent(
  request: ReparentRequest,
  accessToken: string | null
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => reparent(request, accessToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics', request.spaceId] });
    },
  });
}
