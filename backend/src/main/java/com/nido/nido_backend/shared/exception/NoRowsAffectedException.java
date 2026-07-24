package com.nido.nido_backend.shared.exception;

public class NoRowsAffectedException extends RuntimeException {
    public NoRowsAffectedException(String message) {
        super(message);
    }
}
