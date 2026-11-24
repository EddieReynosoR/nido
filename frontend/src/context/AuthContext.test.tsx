import { render, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';
import QueryProvider from '@/context/QueryProvider';
import { ApiError } from '@/lib/http';

const refreshTokenAsync = vi.fn();

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
  Toaster: () => null,
}));

vi.mock('@/api/auth', () => ({
  refresh: (...args: unknown[]) => refreshTokenAsync(...args),
}));

vi.mock('@/hooks/use-csrf', () => ({
  useCsrf: () => ({ mutate: vi.fn() }),
}));

vi.mock('@/hooks/use-login', () => ({
  useLogin: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/use-logout', () => ({
  useLogout: () => ({ mutate: vi.fn() }),
}));

function renderApp() {
  const router = createMemoryRouter(
    [
      {
        Component: QueryProvider,
        children: [
          {
            Component: AuthProvider,
            children: [
              { path: '/', element: null },
              { path: '/login', element: null },
            ],
          },
        ],
      },
    ],
    { initialEntries: ['/'] }
  );
  render(<RouterProvider router={router} />);
  return router;
}

describe('AuthProvider startup refresh', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('isAuthenticated', 'true');
    document.cookie = 'XSRF-TOKEN=csrf';
  });

  it('shows the account unavailable message and goes to login when the refresh fails with account_unavailable', async () => {
    refreshTokenAsync.mockRejectedValue(
      new ApiError({ status: 401, code: 'account_unavailable' })
    );

    const router = renderApp();

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'));
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith(
      'Your account is no longer available',
      expect.any(Object)
    );
    expect(toast.error).not.toHaveBeenCalledWith(
      'Session expired',
      expect.anything()
    );
    expect(localStorage.getItem('isAuthenticated')).toBeNull();
  });
});
