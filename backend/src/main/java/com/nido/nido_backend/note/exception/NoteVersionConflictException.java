package com.nido.nido_backend.note.exception;

import java.time.Instant;

public class NoteVersionConflictException extends RuntimeException {
    private final Long currentVersion;
    private final Instant updatedAt;

    public NoteVersionConflictException(Long currentVersion, Instant updatedAt) {
        super("Version conflict, current version is " + currentVersion);
        this.currentVersion = currentVersion;
        this.updatedAt = updatedAt;
    }

    public Long getCurrentVersion() { return currentVersion; }
    public Instant getUpdatedAt() { return updatedAt; }
}
