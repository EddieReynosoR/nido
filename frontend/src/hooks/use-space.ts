import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSpaces, addSpace } from '@/api/space';
import type { getSpaceResponse } from '@/types/space.types';

export function useSpaces(accessToken: string | null) {
  return useQuery({
    queryKey: ['spaces', accessToken],
    queryFn: () => getSpaces(accessToken!),
    enabled: !!accessToken,
    staleTime: 30000,
  });
}

export function useCreateSpace(accessToken: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => addSpace(name, accessToken!),
    onSuccess: (newSpace) => {
      if (newSpace) {
        queryClient.setQueryData<getSpaceResponse>(
          ['spaces', accessToken],
          (old) => (old ? { ...old, content: [...old.content, newSpace] } : old)
        );
      }
    },
  });
}
