import { afterEach, describe, expect, it, vi } from 'vitest';
import { executeFetch } from '@/api/auth';
import { ApiError } from '@/lib/http';

describe('executeFetch', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('throws an ApiError with account_unavailable when the server answers 401 account_unavailable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: 'account_unavailable',
            error_description: 'The account is no longer available',
          }),
          { status: 401 }
        )
      )
    );

    const error = await executeFetch('/spaces', {}, 'Could not load.').catch(
      (e) => e
    );

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(401);
    expect((error as ApiError).code).toBe('account_unavailable');
    expect((error as ApiError).description).toBe(
      'The account is no longer available'
    );
  });

  it('falls back to an http_<status> code when the body has no error code', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('', { status: 502 }))
    );

    const error = await executeFetch('/spaces', {}, 'Could not load.').catch(
      (e) => e
    );

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe('http_502');
    expect((error as ApiError).description).toBeUndefined();
  });
});
