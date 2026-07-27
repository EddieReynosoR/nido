package com.nido.nido_backend.shared.exception;

public class TokenException extends RuntimeException {
  private final String errorCode;

  public TokenException(String errorCode, String message) {
    super(message);
    this.errorCode = errorCode;
  }

  public String getErrorCode() {
    return errorCode;
  }
}
