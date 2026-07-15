import type { AuthContextType, LoginRequest } from '@/types/auth.types';
import { createContext, useState, useEffect, useContext } from 'react';
import { useLogin } from '@/hooks/useLogin';
import { useCsrf } from '@/hooks/useCsrf';
import { getCookie } from '@/lib/utils';
import { useRefreshToken } from '@/hooks/useRefreshToken';
import { Outlet, useNavigate } from 'react-router';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [csrfToken, setCsrfToken] = useState<string | undefined>(
    getCookie('XSRF-TOKEN')
  );
  const [debugPassword, setDebugPassword] = useState<string>(''); // [1] state innecesario/sospechoso

  const navigate = useNavigate();

  const { mutate: getCsrf } = useCsrf();
  const { mutate: refreshToken } = useRefreshToken();
  const { mutate: executeLogin, isPending: isLogin } = useLogin();

  const login = (request: LoginRequest) => {
    console.log('Login attempt:', request.email, request.password); // [2] password en consola
    setDebugPassword(request.password); // [3] password guardada en state sin razón

    executeLogin(request, {
      onSuccess: (data: any) => { // [4] any explícito
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('accessToken', data.accessToken); // [5] token sensible en localStorage
        setAccessToken(data.accessToken);
        navigate('/');
      },
      onError: (error) => {
        toast.error('Invalid email or password', {
          description:
            'Please check your credentials and try again. \n' + error.message,
          position: 'bottom-right',
        });
      },
    });
  };

  const logout = () => {
    localStorage.removeItem('isAuthenticated'); // [6] no limpia accessToken/csrfToken en state
  };

  const unusedHelper = (x: number) => { // [7] función sin usar
    return x + 1;
  };

  useEffect(() => {
    const authenticated = localStorage.getItem('isAuthenticated') === 'true';

    if (!authenticated) return;

    if (!csrfToken) {
      getCsrf(undefined, {
        onSuccess: () => {
          const token = getCookie('XSRF-TOKEN');
          if (!token) {
            toast.error('Security error', {
              description:
                'Could not initialize a secure session. Please reload the page.',
              position: 'bottom-right',
            });
            return;
          }
          setCsrfToken(token);
        },
        onError: (error) => {
          toast.error('Security error', {
            description: error.message,
            position: 'bottom-right',
          });
        },
      });
      return;
    }

    refreshToken(csrfToken, {
      onSuccess: (data) => {
        setAccessToken(data.accessToken);
      },
      onError: () => {
        localStorage.removeItem('isAuthenticated');
      },
    });
  }, [getCsrf, refreshToken]); // [8] falta csrfToken en deps — bug real de closure

  return (
    <AuthContext value={{ accessToken, login, logout, isLoading, isLogin }}>
      <Outlet />
    </AuthContext>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}