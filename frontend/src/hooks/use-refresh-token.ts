import { refresh } from '@/api/auth';
import { useMutation } from '@tanstack/react-query';

export function useRefreshToken() {
  return useMutation({
    mutationFn: refresh,
  });
}
