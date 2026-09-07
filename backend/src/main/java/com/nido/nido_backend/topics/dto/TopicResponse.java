package com.nido.nido_backend.topics.dto;

import com.nido.nido_backend.topics.TopicEntity;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public record TopicResponse(UUID topicId, String name, String color, UUID parentId, UUID spaceId, List<TopicResponse> topics) {
    public static TopicResponse from(TopicEntity entity) {

        return new TopicResponse(
                entity.getTopicId(),
                entity.getName(),
                entity.getColor(),
                entity.getParentTopicId(),
                entity.getSpace().getSpaceId(),
                new ArrayList<>());
    }

    public static List<TopicResponse> toList(List<TopicEntity> entities) {
        return entities.stream().map(TopicResponse::from).toList();
    }

    public TopicResponse withTopics(List<TopicResponse> topics) {
        return new TopicResponse(topicId, name, color, parentId, spaceId, topics);
    }
}
