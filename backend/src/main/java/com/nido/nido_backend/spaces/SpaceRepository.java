package com.nido.nido_backend.spaces;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface SpaceRepository extends JpaRepository<SpaceEntity, UUID> {
    boolean existsByUserIdAndName(UUID userId, String name);

    Page<SpaceEntity> findByUserId(UUID userId, Pageable pageable);

    @Modifying
    @Query("DELETE FROM SpaceEntity s WHERE s.spaceId = :spaceId")
    int deleteBySpaceId(@Param("spaceId") UUID spaceId);
}
