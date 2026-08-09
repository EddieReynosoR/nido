package com.nido.nido_backend.shared.exception;

public class RecordAlreadyExists extends RuntimeException {
    public RecordAlreadyExists(String message) {
        super(message);
    }
}
