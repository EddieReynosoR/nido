package com.nido.nido_backend.topics.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateParentRequest(
        @NotNull @NotBlank String topicId,
        @NotNull @NotBlank String spaceId,
        String newParentId) {
}
