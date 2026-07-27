package com.nido.nido_backend.shared.exception;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AccountStatusException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.security.NoSuchAlgorithmException;
import java.util.NoSuchElementException;
import java.util.Optional;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BadCredentialsException.class)
    public ProblemDetail handleBadCredentials(BadCredentialsException ex) {
        return build(401, ex, "The username or password is incorrect");
    }

    @ExceptionHandler(AccountStatusException.class)
    public ProblemDetail handleAccountStatus(AccountStatusException ex) {
        return build(403, ex, "The account is locked");
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ProblemDetail handleAccessDenied(AccessDeniedException ex) {
        return build(403, ex, "You are not authorized to access this resource");
    }

    @ExceptionHandler(SignatureException.class)
    public ProblemDetail handleSignature(SignatureException ex) {
        return build(403, ex, "The JWT signature is invalid");
    }

    @ExceptionHandler(ExpiredJwtException.class)
    public ProblemDetail handleExpiredJwt(ExpiredJwtException ex) {
        return build(403, ex, "The JWT token has expired");
    }

    @ExceptionHandler(RefreshTokenNotValidException.class)
    public ProblemDetail handleRefreshTokenInvalid(RefreshTokenNotValidException ex) {
        return build(401, ex, "refresh_token_invalid", "The refresh token was not valid.");
    }

    @ExceptionHandler(RefreshTokenExpiredException.class)
    public ProblemDetail handleRefreshTokenExpired(RefreshTokenExpiredException ex) {
        return build(401, ex, "refresh_token_expired","The refresh token was not valid.");
    }

    @ExceptionHandler(UserWithoutEmailException.class)
    public ProblemDetail handleUserWithoutEmail(UserWithoutEmailException ex) {
        return build(401, ex, "The user does not have an email.");
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ProblemDetail handleNoSuchElement(NoSuchElementException ex) {
        return build(404, ex, ex.getMessage());
    }

    @ExceptionHandler(IllegalStateException.class)
    public ProblemDetail handleIllegalState(IllegalStateException ex) {
        return build(500, ex, ex.getMessage());
    }

    @ExceptionHandler(NoRowsAffectedException.class)
    public ProblemDetail handleNoRowsAffected(NoRowsAffectedException ex) {
        return build(409, ex, ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleUnknown(Exception ex) {
        return build(500, ex, "Unknown internal server error.");
    }

    private ProblemDetail build(int status, Exception ex, String error, String description) {
        ex.printStackTrace();
        ProblemDetail detail = ProblemDetail.forStatusAndDetail(HttpStatusCode.valueOf(status), ex.getMessage());

        if (error != null) {
            detail.setProperty("error", error);
        }

        detail.setProperty("error_description", description);
        return detail;
    }

    private ProblemDetail build(int status, Exception ex, String description) {
        return build(status, ex, null, description);
    }
}
