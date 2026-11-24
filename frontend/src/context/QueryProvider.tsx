import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { Outlet } from 'react-router';
import { ApiError } from '@/lib/http';
import { errorToast } from '@/lib/toast';

type RegisterHandler = (handler: () => void) => () => void;

const AccountUnavailableContext = createContext<RegisterHandler | null>(null);

export default function QueryProvider() {
  const [listeners] = useState(() => new Set<() => void>());

  const register = useCallback<RegisterHandler>(
    (handler) => {
      listeners.add(handler);
      return () => {
        listeners.delete(handler);
      };
    },
    [listeners]
  );

  const notifyAccountUnavailable = useCallback(() => {
    listeners.forEach((listener) => listener());
  }, [listeners]);

  const [queryClient] = useState(() => {
    let handled = false;

    const onSuccess = () => {
      handled = false;
    };

    const onError = (error: Error) => {
      if (
        error instanceof ApiError &&
        error.code === 'account_unavailable' &&
        !handled
      ) {
        handled = true;
        errorToast({
          id: 'account-unavailable',
          error,
          title: 'Your account is no longer available',
        });
        notifyAccountUnavailable();
        client.clear();
      }
    };

    const client: QueryClient = new QueryClient({
      queryCache: new QueryCache({ onError, onSuccess }),
      mutationCache: new MutationCache({ onError, onSuccess }),
    });

    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AccountUnavailableContext value={register}>
        <Outlet />
      </AccountUnavailableContext>
    </QueryClientProvider>
  );
}

export function useAccountUnavailableHandler(handler: () => void) {
  const register = useContext(AccountUnavailableContext);

  if (register === null) {
    throw new Error(
      'useAccountUnavailableHandler must be used within a QueryProvider'
    );
  }

  useEffect(() => register(handler), [register, handler]);
}
