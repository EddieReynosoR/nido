package com.nido.nido_backend.topic.dto;

import com.nido.nido_backend.topic.TopicEntity;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public record TopicResponse(UUID topicId, String name, String color, UUID parentId, UUID spaceId, Instant deletedAt, List<TopicResponse> topics, UUID noteId) {
    public static TopicResponse from(TopicEntity entity) {

        return new TopicResponse(
                entity.getTopicId(),
                entity.getName(),
                entity.getColor(),
                entity.getParentTopicId(),
                entity.getSpaceId(),
                entity.getDeletedAt(),
                new ArrayList<>(),
                null);
    }

    public static List<TopicResponse> toList(List<TopicEntity> entities) {
        return entities.stream().map(TopicResponse::from).toList();
    }

    public TopicResponse withTopics(List<TopicResponse> topics) {
        return new TopicResponse(topicId, name, color, parentId, spaceId, deletedAt, topics, noteId);
    }

    public TopicResponse withNote(UUID noteId) {
        return new TopicResponse(topicId, name, color, parentId, spaceId, deletedAt, topics, noteId);
    }
}
