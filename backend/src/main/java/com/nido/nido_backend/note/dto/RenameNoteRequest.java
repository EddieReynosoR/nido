package com.nido.nido_backend.note.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record RenameNoteRequest(
        @NotNull @Size(max = 150) String title,
        @NotNull Long version,
        UUID topicId) {
}
