package com.nido.nido_backend.shared.exception;

public class RefreshTokenExpiredException extends TokenException {
    public RefreshTokenExpiredException() {
        super("refresh_token_expired", "The refresh token has expired, please sign in again");
    }
}
