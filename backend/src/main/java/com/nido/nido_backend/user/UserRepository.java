package com.nido.nido_backend.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {
    @Query("""
        SELECT u FROM UserEntity u
        WHERE u.userId=:userId
            AND u.deletedAt IS NULL
    """)
    Optional<UserEntity> findByUserId(@Param("userId") UUID userId);

    @Query("""
        SELECT u FROM UserEntity u
        WHERE u.email=:email
            AND u.deletedAt IS NULL
    """)
    Optional<UserEntity> findByEmail(@Param("email") String email);

    @Query("""
        SELECT u.email FROM UserEntity u
        WHERE u.userId=:userId
            AND u.deletedAt IS NULL
    """)
    Optional<String> findEmailByUserId(@Param("userId") UUID userId);
}
