import { useMutation } from '@tanstack/react-query';
import { csrf } from '@/api/auth';

export function useCsrf() {
  return useMutation({
    mutationFn: csrf,
  });
}
