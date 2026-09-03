package com.nido.nido_backend.topics.dto;

import com.nido.nido_backend.spaces.SpaceEntity;
import com.nido.nido_backend.topics.TopicEntity;

import java.util.UUID;

public record TopicRequest(String name, String color, UUID spaceId, UUID parentTopicId) {
    public TopicEntity toEntity(SpaceEntity space, TopicEntity parentTopic) {
        TopicEntity entity = new TopicEntity();

        entity.setName(name);
        entity.setColor(color);
        entity.setSpace(space);
        entity.setParentTopic(parentTopic);

        return entity;
    }
}
