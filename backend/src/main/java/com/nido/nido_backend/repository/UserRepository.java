package com.nido.nido_backend.repository;

import com.nido.nido_backend.domain.user.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {
    Optional<UserEntity> findByEmail(String email);
    Optional<String> findEmailByUserId(UUID userId);
}
