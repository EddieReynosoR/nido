package com.nido.nido_backend.spaces;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface SpaceRepository extends JpaRepository<SpaceEntity, UUID> {

    boolean existsByUserIdAndNameAndDeletedAtIsNull(UUID userId, String name);

    boolean existsByUserIdAndSpaceIdAndDeletedAtIsNull(UUID userId, UUID spaceId);

    Page<SpaceEntity> findByUserIdAndDeletedAtIsNull(UUID userId, Pageable pageable);

    Optional<SpaceEntity> findBySpaceIdAndUserIdAndDeletedAtIsNull(UUID spaceId, UUID userId);

    @Modifying
    @Query("""
        UPDATE Space s
           SET s.deletedAt = :now
         WHERE s.spaceId = :spaceId
           AND s.deletedAt IS NULL
        """)
    int softDeleteBySpaceIdAndUserId(@Param("spaceId") UUID spaceId,
                                     @Param("now") Instant now);
}
