package com.nido.nido_backend.note.dto;

import java.time.Instant;

public record MoveNoteResponse(String title,
                               Long version,
                               Instant updatedAt) {
}
