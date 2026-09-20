package com.nido.nido_backend.topics;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TopicRepository extends JpaRepository<TopicEntity, UUID> {
    @Query("""
    SELECT COUNT(t) > 0
        FROM Topic t
    WHERE LOWER(t.name) = LOWER(:name)
      AND t.spaceId = :spaceId
      AND t.parentTopicId IS NULL
      AND t.deletedAt IS NULL
    """)
    boolean existsRootByNameAndSpaceId(@Param("name") String name, @Param("spaceId") UUID spaceId);

    @Query("""
        SELECT COUNT(t) > 0
            FROM Topic t
        WHERE LOWER(t.name) = LOWER(:name)
            AND t.parentTopicId = :parentTopicId
            AND t.deletedAt IS NULL
        """)
    boolean existsChildByNameAndParentTopicId(@Param("name") String name, @Param("parentTopicId") UUID parentTopicId);

    @Query("""
        SELECT t
            FROM Topic t
        WHERE t.topicId = :topicId
            AND t.spaceId = :spaceId
            AND t.deletedAt IS NULL
        """)
    Optional<TopicEntity> findByTopicIdAndSpaceId(@Param("topicId") UUID topicId, @Param("spaceId") UUID spaceId);

    @Query("SELECT t FROM Topic t WHERE t.spaceId = :spaceId AND t.deletedAt IS NULL ORDER BY t.name ASC")
    List<TopicEntity> getBySpaceId(@Param("spaceId") UUID spaceId);

    @Query(value = """
        WITH RECURSIVE ancestors AS (
            SELECT topic_id, parent_topic_id, 1 AS depth
                FROM topics
            WHERE topic_id = :newParentId
                AND space_id = :spaceId
                AND deleted_at IS NULL
            UNION ALL
            SELECT t.topic_id, t.parent_topic_id, a.depth + 1
                FROM topics t
                JOIN ancestors a ON t.topic_id = a.parent_topic_id
            WHERE t.space_id = :spaceId
                AND t.deleted_at IS NULL
                AND a.depth < :maxDepth
        )
        SELECT EXISTS (SELECT 1 FROM ancestors WHERE topic_id = :topicId)
        """, nativeQuery = true)
    boolean isAncestorOrSelf(@Param("topicId") UUID topicId,
                             @Param("newParentId") UUID newParentId,
                             @Param("spaceId") UUID spaceId,
                             @Param("maxDepth") int maxDepth);

    @Query("""
    SELECT t FROM Topic t
        JOIN Space s ON t.spaceId = s.spaceId
    WHERE t.topicId = :topicId
        AND s.userId = :userId
        AND t.deletedAt IS NULL
        AND s.deletedAt IS NULL
    """)
    Optional<TopicEntity> getByTopicIdAndUserId(@Param("topicId") UUID topicId, @Param("userId") UUID userId);

    @Modifying
    @Query(value = """
        WITH RECURSIVE subtree AS (
            SELECT topic_id FROM topics WHERE topic_id = :topicId
            UNION ALL
            SELECT t.topic_id FROM topics t
            JOIN subtree s ON t.parent_topic_id = s.topic_id
            WHERE t.deleted_at IS NULL
        )
        UPDATE topics
        SET deleted_at = now()
        WHERE topic_id IN (SELECT topic_id FROM subtree)
    """, nativeQuery = true)
    int softDeleteSubtree(@Param("topicId") UUID topicId);
}
