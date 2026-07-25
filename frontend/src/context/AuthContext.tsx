import type {
  AuthStatus,
  AuthContextType,
  LoginRequest,
} from '@/types/auth.types';
import {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
} from 'react';
import { useLogin } from '@/hooks/useLogin';
import { useCsrf } from '@/hooks/useCsrf';
import { useLogout } from '@/hooks/useLogout';
import { errorToast } from '@/lib/toast';
import { isValidTokenResponse, getCookie, isAuthenticated } from '@/lib/auth';
import { useRefreshToken } from '@/hooks/useRefreshToken';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { toast, Toaster } from 'sonner';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | undefined>(
    getCookie('XSRF-TOKEN')
  );
  const [status, setStatus] = useState<AuthStatus>('loading');

  const location = useLocation();
  const navigate = useNavigate();

  const from = location.state?.from?.pathname ?? '/';

  const { mutate: getCsrf } = useCsrf();
  const { mutateAsync: refreshTokenAsync } = useRefreshToken();
  const { mutate: executeLogin, isPending: isLogin } = useLogin();
  const { mutate: executeLogout } = useLogout();

  const finishLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setAccessToken(null);
    navigate('/login');
    setStatus('guest');
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
        setStatus('authed');
        navigate(from);
      },
      onError: (error) => {
        errorToast({
          error,
          title: 'Invalid email or password',
          customMessage: 'Please check your credentials and try again.',
        });
      },
    });
  };

  const logout = () => {
    if (!accessToken) {
      toast.error('User not authenticated', {
        description: "There's no authenticated user.",
        position: 'bottom-right',
      });
      return;
    }

    executeLogout(csrfToken!, {
      onSuccess: () => {
        finishLogout();
      },
      onError: (error) => {
        errorToast({ error, customMessage: 'Something went wrong' });
        finishLogout();
      },
    });
  };

  if (!isAuthenticated()) {
    setStatus('guest');
    return;
  }

  const refreshAttempted = useRef(false);

  useEffect(() => {
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
          errorToast({ error, title: 'Security Error' });
          setStatus('guest');
        },
      });
      return;
    }

    if (refreshAttempted.current) return;
    refreshAttempted.current = true;

    (async () => {
      try {
        const data = await refreshTokenAsync(csrfToken);

        if (!isValidTokenResponse(data)) {
          setStatus('guest');
          return;
        }
        setAccessToken(data.accessToken);
        setStatus('authed');
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        errorToast({ error: err, title: 'Authentication Refreshing Error' });

        localStorage.removeItem('isAuthenticated');
        setAccessToken(null);
        setStatus('guest');
      }
    })();
  }, [getCsrf, refreshTokenAsync, csrfToken]);

  return (
    <AuthContext value={{ accessToken, status, login, logout, isLogin }}>
      <Outlet />
      <Toaster />
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
