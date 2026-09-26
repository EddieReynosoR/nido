package com.nido.nido_backend.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {
    Optional<UserEntity> findByUserId(UUID userId);

    Optional<UserEntity> findByEmail(String email);

    @Query("""
        SELECT u.email FROM UserEntity u
        WHERE u.userId=:userId
            AND u.deletedAt IS NULL
    """)
    Optional<String> findEmailByUserId(@Param("userId") UUID userId);
}
