import type { AuthContextType, LoginRequest } from '@/types/auth.types';
import { createContext, useState, useEffect, useContext } from 'react';
import { useLogin } from '@/hooks/useLogin';
import { useCsrf } from '@/hooks/useCsrf';
import { useLogout } from '@/hooks/useLogout';
import {
  getCookie,
  isValidTokenResponse,
  isAuthenticated,
  HttpError,
} from '@/lib/utils';
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

  const finishLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setAccessToken(null);
    navigate('/login');
  };

  const login = (request: LoginRequest) => {
    executeLogin(request, {
      onSuccess: (data) => {
        if (!isValidTokenResponse(data)) {
          toast.error('Login response invalid', {
            description: 'Login response was invalid, please try again',
            position: 'bottom-right',
          });
          return;
        }

        localStorage.setItem('isAuthenticated', 'true');
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
    if (!isAuthenticated()) {
      toast.error('User not authenticated', {
        description: "There's no authenticated user.",
        position: 'bottom-right',
      });
      return;
    }

    if (!csrfToken) {
      toast.error('CSRF Token invalid', {
        description: 'The CSRF token is not valid',
        position: 'bottom-right',
      });
      return;
    }

    executeLogout(csrfToken, {
      onSuccess: () => {
        finishLogout();
      },
      onError: (error) => {
        const isServerError = error instanceof HttpError && error.status >= 500;

        if (isServerError) {
          toast.error('Server Error', {
            description: error.message,
            position: 'bottom-right',
          });
          return;
        }

        toast.error(isServerError ? 'Server Error' : 'Logout failed', {
          description:
            error instanceof Error ? error.message : 'Something went wrong',
          position: 'bottom-right',
        });

        finishLogout();
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
          console.warn('There was a problem with the Refresh Token');
          localStorage.removeItem('isAuthenticated');
          return;
        }

        setAccessToken(data.accessToken);
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
