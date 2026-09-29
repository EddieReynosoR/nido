package com.nido.nido_backend.note;

import com.nido.nido_backend.note.dto.TopicNoteIdDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NoteRepository extends JpaRepository<NoteEntity, UUID> {
    @Query("""
        SELECT n.topicId as topicId, n.noteId as noteId FROM Note n
        WHERE n.topicId IN :topicIds
            AND n.isIntro = true
            AND n.deletedAt IS NULL
    """)
    List<TopicNoteIdDto> findIntroNotesByTopicIds(@Param("topicIds") List<UUID> topicIds);

    @Query("""
        SELECT n FROM Note n
        JOIN Topic t ON t.topicId = n.topicId
        WHERE n.noteId = :noteId
            AND n.topicId = :topicId
            AND t.deletedAt IS NULL
            AND n.deletedAt IS NULL
    """)
    Optional<NoteEntity> getByIdAndTopicId(@Param("noteId") UUID noteId, @Param("topicId") UUID topicId);
}
