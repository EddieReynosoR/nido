package com.nido.nido_backend.topic.dto;

import com.nido.nido_backend.note.dto.NoteTreeResponse;
import com.nido.nido_backend.topic.TopicEntity;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public record TopicResponse(
        UUID topicId,
        String name,
        String color,
        UUID parentId,
        UUID spaceId,
        Instant deletedAt,
        List<TopicResponse> topics,
        UUID noteId,
        List<NoteTreeResponse> notes) {
    public static TopicResponse from(TopicEntity entity) {

        return new TopicResponse(
                entity.getTopicId(),
                entity.getName(),
                entity.getColor(),
                entity.getParentTopicId(),
                entity.getSpaceId(),
                entity.getDeletedAt(),
                new ArrayList<>(),
                null,
                new ArrayList<>());
    }

    public static List<TopicResponse> toList(List<TopicEntity> entities) {
        return entities.stream().map(TopicResponse::from).toList();
    }

    public TopicResponse withTopics(List<TopicResponse> topics) {
        return copy(topics, noteId, notes);
    }

    public TopicResponse withIntroNote(UUID noteId) {
        return copy(topics, noteId, notes);
    }

    public TopicResponse withNotes(List<NoteTreeResponse> notes) { return copy(topics,noteId, notes); }

    private TopicResponse copy(List<TopicResponse> topics, UUID noteId, List<NoteTreeResponse> notes) {
        return new TopicResponse(topicId, name, color, parentId, spaceId, deletedAt, topics, noteId, notes);
    }
}
