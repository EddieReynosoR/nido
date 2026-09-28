package com.nido.nido_backend.note.dto;

import com.nido.nido_backend.note.NoteEntity;
import tools.jackson.databind.JsonNode;

import java.util.UUID;

public record NoteResponse(
        UUID noteId,
        String title,
        JsonNode content,
        UUID topicId,
        boolean isIntro) {

    public static NoteResponse from(NoteEntity entity, JsonNode content) {
        return new NoteResponse(
                entity.getNoteId(),
                entity.getTitle(),
                content,
                entity.getTopicId(),
                entity.isIntro()
        );
    }
}
