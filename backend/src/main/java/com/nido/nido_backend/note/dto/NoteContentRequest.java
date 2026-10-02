package com.nido.nido_backend.note.dto;

import jakarta.validation.constraints.NotNull;
import tools.jackson.databind.JsonNode;

public record NoteContentRequest(
        @NotNull JsonNode content,
        @NotNull Long version) {
}
