package com.nido.nido_backend.note.dto;

import com.nido.nido_backend.note.NoteEntity;

import java.time.Instant;

public record NoteContentResponse(
        long version,
        Instant updatedAt
) {
    public static NoteContentResponse from(NoteEntity entity) {
        return new NoteContentResponse(entity.getVersion(), entity.getUpdatedAt());
    }
}
