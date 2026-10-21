package com.nido.nido_backend.topic.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record UpdateTopicRequest(
        @NotBlank @Size(max = 50) String name,
        @NotBlank @Size(max = 6) String color,
        @NotNull UUID topicId) {

    public UpdateTopicRequest withName(String name) {
        return new UpdateTopicRequest(name, color, topicId);
    }
}
