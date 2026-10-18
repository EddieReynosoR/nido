package com.nido.nido_backend.note.dto;

import com.nido.nido_backend.note.NoteEntity;
import tools.jackson.databind.JsonNode;

import java.time.Instant;
import java.util.UUID;

public record NoteResponse(
        UUID noteId,
        String title,
        JsonNode content,
        UUID spaceId,
        UUID topicId,
        boolean isIntro,
        long version,
        Instant updatedAt) {

    public static NoteResponse from(NoteEntity entity, JsonNode content) {
        return new NoteResponse(
                entity.getNoteId(),
                entity.getTitle(),
                content,
                entity.getSpaceId(),
                entity.getTopicId(),
                entity.isIntro(),
                entity.getVersion(),
                entity.getUpdatedAt()
        );
    }
}
