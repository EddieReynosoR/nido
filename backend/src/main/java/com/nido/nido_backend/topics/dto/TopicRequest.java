package com.nido.nido_backend.topics.dto;

import com.nido.nido_backend.spaces.SpaceEntity;
import com.nido.nido_backend.topics.TopicEntity;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record TopicRequest(
        @NotBlank @Size(max = 50) String name,
        @Size(max = 6) String color,
        @NotNull @NotBlank UUID spaceId,
        UUID parentTopicId) {
    public TopicEntity toEntity(SpaceEntity space, @Nullable TopicEntity parentTopic) {
        TopicEntity entity = new TopicEntity();

        entity.setName(name);
        entity.setColor(color);
        entity.setSpace(space);
        entity.setParentTopic(parentTopic);

        return entity;
    }
}
