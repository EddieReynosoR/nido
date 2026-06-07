package com.nido.nido_backend.repository;

import com.nido.nido_backend.domain.user.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {
    Optional<UserEntity> findByEmail(String email);

    @Query("select u.email from UserEntity u where u.userId=:userId")
    Optional<String> findEmailByUserId(@Param("userId") UUID userId);
}
