package com.nido.nido_backend.topics;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface TopicRepository extends JpaRepository<TopicEntity, UUID> {
    @Query("SELECT COUNT(t) > 0 FROM Topic t WHERE t.name = :name AND t.space.userId = :userId")
    boolean existsByNameAndUserId(@Param("name") String name, @Param("userId") UUID userId);

    @Query("SELECT t FROM Topic t WHERE t.topic_id = :topicId AND t.space.userId = :userId")
    TopicEntity getByIdAndUserId(@Param("topicId") UUID topicId, @Param("userId") UUID userId);
}
