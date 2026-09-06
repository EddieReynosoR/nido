package com.nido.nido_backend.topics.dto;

import com.nido.nido_backend.topics.TopicEntity;

import java.util.List;
import java.util.Optional;

public record TopicResponse(String topicId, String name, String color, String parentId, String spaceId, List<TopicResponse> topics) {
    public static TopicResponse from(TopicEntity entity) {
        String topicId = Optional.ofNullable(entity.getParentTopic())
                .map(TopicEntity::getTopicId)
                .map(Object::toString)
                .orElse(null);

        return new TopicResponse(
                entity.getTopicId().toString(),
                entity.getName(),
                entity.getColor(),
                topicId,
                entity.getSpace().getSpaceId().toString(),
                null);
    }

    public static List<TopicResponse> toList(List<TopicEntity> entities) {
        return entities.stream().map(TopicResponse::from).toList();
    }

    public TopicResponse withTopics(List<TopicResponse> topics) {
        return new TopicResponse(topicId, name, color, parentId, spaceId, topics);
    }
}
