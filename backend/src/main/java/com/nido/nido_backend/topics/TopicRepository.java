package com.nido.nido_backend.topics;

import org.springframework.data.jpa.repository.JpaRepository;
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
}
