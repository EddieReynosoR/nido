package com.nido.nido_backend.shared.exception;

public class RefreshTokenInvalidException extends TokenException  {
  public RefreshTokenInvalidException() {
    super("refresh_token_invalid", "The refresh token is invalid or has been revoked");
  }
}
