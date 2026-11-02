package com.nido.nido_backend.note;

import com.nido.nido_backend.note.dto.TopicNoteIdDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NoteRepository extends JpaRepository<NoteEntity, UUID> {
    @Query("""
    SELECT n.title
        FROM Note n
    WHERE LOWER(SUBSTRING(n.title, 1, LENGTH(:prefix))) = LOWER(:prefix)
      AND n.spaceId = :spaceId
      AND n.topicId IS NULL
      AND n.deletedAt IS NULL
    """)
    List<String> findRootTitlesStartingWith(@Param("prefix") String prefix,
                                            @Param("spaceId") UUID spaceId);

    @Query("""
    SELECT n.title
        FROM Note n
    WHERE LOWER(SUBSTRING(n.title, 1, LENGTH(:prefix))) = LOWER(:prefix)
      AND n.spaceId = :spaceId
      AND n.topicId = :topicId
      AND n.isIntro IS FALSE
      AND n.deletedAt IS NULL
    """)
    List<String> findByTopicTitlesStartingWith(@Param("prefix") String prefix,
                                               @Param("spaceId") UUID spaceId,
                                               @Param("topicId") UUID topicId);

    @Query("""
        SELECT n.topicId as topicId, n.noteId as noteId FROM Note n
        WHERE n.topicId IN :topicIds
            AND n.isIntro = true
            AND n.deletedAt IS NULL
    """)
    List<TopicNoteIdDto> findIntroNotesByTopicIds(@Param("topicIds") List<UUID> topicIds);

    @Query("""
        SELECT n FROM Note n
        WHERE n.isIntro = false
            AND n.spaceId = :spaceId
            AND n.deletedAt IS NULL
        ORDER BY n.title ASC
    """)
    List<NoteEntity> findNotesBySpaceId(@Param("spaceId") UUID spaceId);

    @Query("""
        SELECT n FROM Note n
        JOIN Space s ON s.spaceId = n.spaceId
        WHERE n.noteId = :noteId
            AND s.userId = :userId
            AND s.deletedAt IS NULL
            AND n.deletedAt IS NULL
    """)
    Optional<NoteEntity> getByIdAndUserId(@Param("noteId") UUID noteId, @Param("userId") UUID userId);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("""
        UPDATE Note n
        SET n.deletedAt = :deletedAt
        WHERE n.topicId IN :topicIds
            AND n.deletedAt IS NULL
    """)
    void softDeleteByTopicIds(@Param("topicIds") List<UUID> topicIds,
                             @Param("deletedAt") Instant deletedAt);
}
