import { useMutation } from '@tanstack/react-query';
import { login } from '@/api/login';
import { useNavigate } from 'react-router';
import type { LoginClaims } from '@/types/auth.types';

export function useLogin() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: login,
    onSuccess: (data: LoginClaims) => {
      console.log(data);
      navigate('/');
    },
  });
}
