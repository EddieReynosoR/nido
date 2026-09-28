package com.nido.nido_backend.note.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import tools.jackson.databind.JsonNode;

import java.util.UUID;

public record CreateNoteRequest(
        @NotBlank String title,
        @NotNull JsonNode content,
        @NotNull UUID topicId,
        boolean isIntro) {
}
