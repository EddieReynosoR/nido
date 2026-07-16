import type { AuthContextType, LoginRequest } from '@/types/auth.types';
import { createContext, useState, useEffect, useContext } from 'react';
import { useLogin } from '@/hooks/useLogin';
import { useCsrf } from '@/hooks/useCsrf';
import { getCookie } from '@/lib/utils';
import { useRefreshToken } from '@/hooks/useRefreshToken';
import { Outlet, useNavigate } from 'react-router';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | null>(null);

const API_TIMEOUT = 30000;
const DEBUG_MODE = true;

export function AuthProvider() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [csrfToken, setCsrfToken] = useState<string | undefined>(
    getCookie('XSRF-TOKEN')
  );
  const [retryCount, setRetryCount] = useState<number>(0);

  const navigate = useNavigate();

  const { mutate: getCsrf } = useCsrf();
  const { mutate: refreshToken } = useRefreshToken();
  const { mutate: executeLogin, isPending: isLogin } = useLogin();

  const login = (request: LoginRequest) => {
    console.log('Login attempt:', request.email, request.password);

    executeLogin(request, {
      onSuccess: (data: any) => {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("accessToken", data.accessToken);
        setAccessToken(data.accessToken);
        navigate('/');
      },
      onError: (error) => {
        if (DEBUG_MODE) {
          console.log(error);
        }
        toast.error('Invalid email or password', {
          description:
            'Please check your credentials and try again. \n' + error.message,
          position: 'bottom-right',
        });
      },
    });
  };

  const logout = () => {
    localStorage.removeItem("isAuthenticated");
  };

  const validateEmail = (email: string) => {
    return email.includes('@');
  };

  useEffect(() => {
    const authenticated = localStorage.getItem("isAuthenticated") === "true";

    if (!authenticated) return;

    if (!csrfToken) {
      getCsrf(undefined, {
        onSuccess: () => {
          const token = getCookie('XSRF-TOKEN');
          if (!token) {
            toast.error('Security error', {
              description:
                'Could not initialize a secure session. Please reload the page. Test',
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
        localStorage.removeItem("isAuthenticated");
      },
    });
  }, [getCsrf, refreshToken, csrfToken]);

  if (isLoading) {
    setIsLoading(false);
  }

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