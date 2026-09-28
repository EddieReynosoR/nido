package com.nido.nido_backend.note.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import tools.jackson.databind.JsonNode;

import java.util.UUID;

public record CreateNoteRequest(
        @NotBlank @Size(max = 150) String title,
        @NotNull JsonNode content,
        @NotNull UUID topicId,
        boolean isIntro) {
}
