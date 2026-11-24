import { useEffect, type ReactNode } from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import QueryProvider, {
  useAccountUnavailableHandler,
} from '@/context/QueryProvider';
import { ApiError } from '@/lib/http';
import { errorToast } from '@/lib/toast';

vi.mock('@/lib/toast', () => ({
  errorToast: vi.fn(),
}));

const CACHED_KEY = ['spaces', 'token'];

let capturedClient: QueryClient;

const accountUnavailable = () =>
  new ApiError({ status: 401, code: 'account_unavailable' });

function Probe({
  onAccountUnavailable,
  children,
}: {
  onAccountUnavailable: () => void;
  children: ReactNode;
}) {
  const queryClient = useQueryClient();
  useEffect(() => {
    capturedClient = queryClient;
    queryClient.setQueryData(CACHED_KEY, ['cached']);
  }, [queryClient]);
  useAccountUnavailableHandler(onAccountUnavailable);
  return children;
}

function FailingQuery() {
  useQuery({
    queryKey: ['content', 'space-1'],
    queryFn: () => Promise.reject(accountUnavailable()),
    retry: false,
  });
  return null;
}

function FailingMutation() {
  const { mutate } = useMutation({
    mutationFn: () => Promise.reject(accountUnavailable()),
  });
  return <button onClick={() => mutate()}>save</button>;
}

function renderApp(child: ReactNode, onAccountUnavailable: () => void) {
  const router = createMemoryRouter([
    {
      Component: QueryProvider,
      children: [
        {
          path: '/',
          element: (
            <Probe onAccountUnavailable={onAccountUnavailable}>{child}</Probe>
          ),
        },
      ],
    },
  ]);
  render(<RouterProvider router={router} />);
}

describe('QueryProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the message, runs the logout cleanup and clears the cache when a query fails with account_unavailable', async () => {
    const onAccountUnavailable = vi.fn();

    renderApp(<FailingQuery />, onAccountUnavailable);

    await waitFor(() => expect(onAccountUnavailable).toHaveBeenCalledTimes(1));
    expect(errorToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Your account is no longer available',
        error: expect.objectContaining({ code: 'account_unavailable' }),
      })
    );
    expect(capturedClient.getQueryData(CACHED_KEY)).toBeUndefined();
  });

  it('shows the message, runs the logout cleanup and clears the cache when a mutation fails with account_unavailable', async () => {
    const onAccountUnavailable = vi.fn();

    renderApp(<FailingMutation />, onAccountUnavailable);
    await act(async () => {
      screen.getByText('save').click();
    });

    await waitFor(() => expect(onAccountUnavailable).toHaveBeenCalledTimes(1));
    expect(errorToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Your account is no longer available',
      })
    );
    expect(capturedClient.getQueryData(CACHED_KEY)).toBeUndefined();
  });
});
