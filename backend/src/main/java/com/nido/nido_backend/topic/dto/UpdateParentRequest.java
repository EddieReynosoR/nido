package com.nido.nido_backend.topic.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateParentRequest(
        @NotNull @NotBlank String topicId,
        @NotNull @NotBlank String spaceId,
        String newParentId) {

    public UpdateParentRequest withName(String name) {
        return new UpdateParentRequest(name, spaceId, newParentId);
    }
}
