package com.nido.nido_backend.shared.exception;

public class RefreshTokenExpired extends RuntimeException {
  public RefreshTokenExpired(String message) {
    super(message);
  }
}
