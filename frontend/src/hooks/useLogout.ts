import { useMutation } from '@tanstack/react-query';
import { logout } from '@/api/auth';

export function useLogout() {
  return useMutation({
    mutationFn: logout,
  });
}
