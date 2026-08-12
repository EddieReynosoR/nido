import { useQuery } from '@tanstack/react-query';
import { getSpaces } from '@/api/space';

export function useSpaces(accessToken: string | null) {
  return useQuery({
    queryKey: ['spaces'],
    queryFn: () => getSpaces(accessToken!),
    enabled: !!accessToken,
    staleTime: 30000,
  });
}
