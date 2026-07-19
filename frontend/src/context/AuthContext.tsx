import type { AuthContextType, LoginRequest } from '@/types/auth.types';
import { createContext, useState, useEffect, useContext } from 'react';
import { useLogin } from '@/hooks/useLogin';
import { useCsrf } from '@/hooks/useCsrf';
import { useLogout } from '@/hooks/useLogout';
import { getCookie, isValidTokenResponse, isAuthenticated } from '@/lib/utils';
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

  const navigate = useNavigate();

  const { mutate: getCsrf } = useCsrf();
  const { mutate: refreshToken } = useRefreshToken();
  const { mutate: executeLogin, isPending: isLogin } = useLogin();
  const { mutate: executeLogout } = useLogout();

  const login = (request: LoginRequest) => {
    executeLogin(request, {
      onSuccess: (data) => {
        if (!isValidTokenResponse(data)) {
          console.warn('Respuesta de refresh inválida:', data);
          return;
        }

        localStorage.setItem('isAuthenticated', 'true');
        setAccessToken(data?.accessToken as string);
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
    if (!isAuthenticated()) {
      toast.error('User not authenticated', {
        description: "There's no authenticated user.",
        position: 'bottom-right',
      });
      return;
    }

    if (!csrfToken) {
      toast.error('CSRF Token invalid', {
        description: "The CSRF token is not valid",
        position: 'bottom-right',
      });
      return;
    }

    executeLogout(csrfToken, {
      onSuccess: () => {
        localStorage.removeItem('isAuthenticated');
        navigate('/login');
      },
      onError: (error) => {
        toast.error('Security error', {
          description: error.message,
          position: 'bottom-right',
        });
      },
    });
  };

  useEffect(() => {
    const authenticated = isAuthenticated();

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
        if (!isValidTokenResponse(data)) {
          console.warn('Respuesta de refresh inválida:', data);
          localStorage.removeItem('isAuthenticated');
          return;
        }

        setAccessToken(data?.accessToken as string);
      },
      onError: () => {
        localStorage.removeItem('isAuthenticated');
      },
    });
  }, [getCsrf, refreshToken, csrfToken]);

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
