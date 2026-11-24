export interface ErrorMessage {
  title: string;
  description?: string;
}

export const ERROR_MESSAGES: Record<string, ErrorMessage> = {
  no_session: {
    title: 'Invalid session',
    description: 'There is no valid session. Please sign in again.',
  },
  bad_credentials: {
    title: 'Invalid email or password',
    description: 'Please check your credentials and try again.',
  },
  account_unavailable: {
    title: 'Your account is no longer available',
    description: 'Please sign in again.',
  },
  expired_token: {
    title: 'Session expired',
    description: 'Please sign in again.',
  },
  invalid_token: {
    title: 'Session invalid',
    description: 'Please sign in again.',
  },
  refresh_token_expired: {
    title: 'Session expired',
    description: 'Please sign in again.',
  },
  refresh_token_invalid: {
    title: 'Session invalid',
    description: 'Please sign in again.',
  },
  forbidden: {
    title: 'Access denied',
    description: 'You are not allowed to access this resource.',
  },
  not_found: {
    title: 'Not found',
    description: 'The resource no longer exists.',
  },
  already_exists: {
    title: 'Already exists',
    description: 'A record with that name already exists.',
  },
  version_conflict: {
    title: 'Version conflict',
    description: 'This item was changed elsewhere. Please try again.',
  },
  validation_error: {
    title: 'Invalid data',
    description: 'One or more fields are invalid.',
  },
  internal_error: {
    title: 'Server error',
    description: 'An unexpected error occurred. Please try again later.',
  },
};
