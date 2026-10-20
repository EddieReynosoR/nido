package com.nido.nido_backend.note.dto;

import com.nido.nido_backend.note.NoteEntity;

import java.time.Instant;
import java.util.UUID;

public record NoteTreeResponse(
    UUID noteId,
    String title,
    UUID spaceId,
    UUID topicId,
    long version,
    Instant updatedAt) {

        public static NoteTreeResponse from(NoteEntity entity) {
            return new NoteTreeResponse(
                    entity.getNoteId(),
                    entity.getTitle(),
                    entity.getSpaceId(),
                    entity.getTopicId(),
                    entity.getVersion(),
                    entity.getUpdatedAt()
            );
        }
}
