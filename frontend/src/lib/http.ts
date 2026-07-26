export const TOKEN_ERROR_CODES = [
  'expired_token',
  'invalid_token',
  'refresh_token_invalid',
  'refresh_token_expired',
] as const;
export type TokenErrorCode = (typeof TOKEN_ERROR_CODES)[number];

export class HttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export class TokenError extends Error {
  typeError: TokenErrorCode;
  constructor(typeError: TokenErrorCode) {
    super();
    this.typeError = typeError;
  }
}
