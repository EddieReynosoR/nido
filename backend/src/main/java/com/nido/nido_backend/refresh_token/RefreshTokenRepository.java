package com.nido.nido_backend.refresh_token;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshTokenEntity, UUID> {
    Optional<RefreshTokenEntity> findByTokenHash(String tokenHash);
    Optional<RefreshTokenEntity> findByUserId(UUID userId);

    @Modifying
    @Query("delete from RefreshTokenEntity r where r.tokenHash=:tokenHash")
    void deleteByTokenHash(@Param("tokenHash") String tokenHash);

    @Modifying
    @Query("delete from RefreshTokenEntity r where r.userId=:userId")
    void deleteByUserId(@Param("userId") UUID userId);
}
