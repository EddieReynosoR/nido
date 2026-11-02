package com.nido.nido_backend.shared.exception;

import com.nido.nido_backend.note.exception.NoteVersionConflictException;
import com.nido.nido_backend.refresh_token.exception.RefreshTokenExpiredException;
import com.nido.nido_backend.refresh_token.exception.RefreshTokenInvalidException;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import org.hibernate.exception.ConstraintViolationException;
import org.slf4j.LoggerFactory;
import org.slf4j.Logger;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.data.core.PropertyReferenceException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ProblemDetail;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatusCode;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BadCredentialsException.class)
    public ProblemDetail handleBadCredentials(BadCredentialsException ex) {
        log.warn("Failed login attempt: {}", ex.getMessage());
        return build(HttpStatus.UNAUTHORIZED, "Authentication failed",
                "bad_credentials", "The username or password is incorrect");
    }

    @ExceptionHandler(ExpiredJwtException.class)
    public ProblemDetail handleExpiredJwt(ExpiredJwtException ex) {
        log.debug("Access token expired");
        return build(HttpStatus.UNAUTHORIZED, "Authentication failed",
                "expired_token", "The access token has expired");
    }

    @ExceptionHandler(JwtException.class)
    public ProblemDetail handleJwt(JwtException ex) {
        log.warn("Invalid JWT presented [{}]: {}", ex.getClass().getSimpleName(), ex.getMessage());
        return build(HttpStatus.UNAUTHORIZED, "Authentication failed",
                "invalid_token", "The access token is invalid");
    }

    @ExceptionHandler(RefreshTokenExpiredException.class)
    public ProblemDetail handleRefreshTokenExpired(RefreshTokenExpiredException ex) {
        log.debug("Refresh token expired");
        return build(HttpStatus.UNAUTHORIZED, "Session expired",
                "refresh_token_expired", "The refresh token has expired, please sign in again");
    }

    @ExceptionHandler(RefreshTokenInvalidException.class)
    public ProblemDetail handleRefreshTokenInvalid(RefreshTokenInvalidException ex) {
        log.warn("Invalid refresh token presented: {}", ex.getMessage());
        return build(HttpStatus.UNAUTHORIZED, "Session invalid",
                "refresh_token_invalid", "The refresh token is invalid or has been revoked");
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ProblemDetail handleAccessDenied(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        return build(HttpStatus.FORBIDDEN, "Access denied",
                "forbidden", "You are not authorized to access this resource");
    }

    @ExceptionHandler(UserWithoutEmailException.class)
    public ProblemDetail handleUserWithoutEmail(UserWithoutEmailException ex) {
        log.error("Data integrity issue — user without email: {}", ex.getMessage());
        return build(HttpStatus.UNPROCESSABLE_CONTENT, "Incomplete account",
                "user_without_email", "The account does not have an email address associated");
    }

    @ExceptionHandler(NoRowsAffectedException.class)
    public ProblemDetail handleNoRowsAffected(NoRowsAffectedException ex) {
        log.warn("No rows affected: {}", ex.getMessage());
        return build(HttpStatus.CONFLICT, "Operation conflict",
                "no_rows_affected", ex.getMessage());
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ProblemDetail handleNoSuchElement(NoSuchElementException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        return build(HttpStatus.NOT_FOUND, "Resource not found",
                "not_found", ex.getMessage());
    }

    @ExceptionHandler(RecordAlreadyExists.class)
    public ProblemDetail handleRecordAlreadyExists(RecordAlreadyExists ex) {
        log.warn("Record already exists: {}", ex.getMessage());
        return build(HttpStatus.CONFLICT, "Record already exists", "already_exists", ex.getMessage());
    }

    @ExceptionHandler(PropertyReferenceException.class)
    public ProblemDetail handleInvalidSortProperty(PropertyReferenceException ex) {
        log.warn("Invalid sort property: {}", ex.getPropertyName());
        return build(HttpStatus.BAD_REQUEST, "Invalid sort property", "invalid_sort",
                "Unknown sort property: " + ex.getPropertyName());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ProblemDetail handleInvalidSortProperty(IllegalArgumentException ex) {
        log.warn("Invalid argument: {}", ex.getMessage());
        return build(HttpStatus.BAD_REQUEST, "Invalid argument", "invalid_argument",
                "Invalid argument: " + ex.getMessage());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ProblemDetail handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        String constraint = constraintNameOf(ex);

        String description = switch (constraint == null ? "" : constraint) {
            case "uq_topic_root_name_per_space_live", "uq_topic_name_per_parent_live" ->
                    "A topic with that name already exists at this level";
            case "uq_note_title_per_space_root_live", "uq_note_title_per_topic_live" ->
                    "A note with that title already exists here";
            case "uq_space_name_per_user_live" -> "A space with that name already exists";
            case "uq_users_email_live" -> "An account with that email already exists";
            default -> "The operation conflicts with an existing record";
        };

        log.warn("Constraint violation [{}]: {}", constraint, ex.getMostSpecificCause().getMessage());

        return build(HttpStatus.CONFLICT, "Record already exists", "already_exists", description);
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleUnknown(Exception ex) {
        log.error("Unhandled exception", ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error",
                "internal_error", "An unexpected error occurred. Please try again later.");
    }

    @ExceptionHandler(NoteVersionConflictException.class)
    public ProblemDetail handleVersionConflict(NoteVersionConflictException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.CONFLICT, "The note was modified elsewhere");
        problem.setTitle("Version conflict");
        problem.setProperty("currentVersion", ex.getCurrentVersion());
        problem.setProperty("updatedAt", ex.getUpdatedAt());
        return problem;
    }

    @ExceptionHandler(OptimisticLockingFailureException.class)
    public ProblemDetail handleConcurrentUpdate(OptimisticLockingFailureException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.CONFLICT, "The note was modified concurrently");
        problem.setTitle("Version conflict");
        return problem;
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {
        Map<String, String> fields = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
            .forEach(fe -> fields.put(fe.getField(), fe.getDefaultMessage()));

        ProblemDetail detail = build(HttpStatus.BAD_REQUEST, "Validation failed", "validation_error", "One or more fields are invalid");
        detail.setProperty("fields", fields);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(detail);
    }

    private String constraintNameOf(DataIntegrityViolationException ex) {
        return ex.getCause() instanceof ConstraintViolationException cause
                ? cause.getConstraintName()
                : null;
    }

    private ProblemDetail build(HttpStatus status, String title, String errorCode, String description) {
        ProblemDetail detail = ProblemDetail.forStatus(status);
        detail.setTitle(title);
        detail.setDetail(description);

        detail.setProperty("error", errorCode);
        detail.setProperty("error_description", description);
        return detail;
    }
}
