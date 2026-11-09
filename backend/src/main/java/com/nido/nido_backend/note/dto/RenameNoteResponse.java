package com.nido.nido_backend.note.dto;

import java.time.Instant;

public record RenameNoteResponse(String title,
                                 Long version,
                                 Instant updatedAt) {
}
