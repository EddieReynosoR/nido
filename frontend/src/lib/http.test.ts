import { describe, expect, it } from 'vitest';
import { isTokenError } from '@/lib/http';

describe('isTokenError', () => {
  it('recognizes account_unavailable as a token error', () => {
    expect(isTokenError('account_unavailable')).toBe(true);
  });

  it.each([
    'expired_token',
    'invalid_token',
    'refresh_token_expired',
    'refresh_token_invalid',
  ])('recognizes %s as a token error', (code) => {
    expect(isTokenError(code)).toBe(true);
  });

  it.each(['not_found', 'forbidden', 'internal_error', ''])(
    'does not recognize %s as a token error',
    (code) => {
      expect(isTokenError(code)).toBe(false);
    }
  );
});
