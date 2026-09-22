package com.nido.nido_backend.topics.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record UpdateTopicRequest(
        @NotNull @NotBlank @Size(max = 50) String name,
        @NotNull @NotBlank @Size(max = 6) String color,
        @NotNull UUID topicId) {
}
