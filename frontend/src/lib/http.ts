interface ApiErrorOptions {
  status: number;
  code: string;
  description?: string;
  message?: string;
}

export class ApiError extends Error {
  status: number;
  code: string;
  description?: string;

  constructor({ status, code, description, message }: ApiErrorOptions) {
    super(message ?? description ?? `Request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.description = description;
  }
}

export function noSessionError(): ApiError {
  return new ApiError({ status: 400, code: 'no_session' });
}
