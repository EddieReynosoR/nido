package com.nido.nido_backend.service;

import com.nido.nido_backend.domain.user.UserEntity;
import com.nido.nido_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserEntity> getUsers() {
        return userRepository.findAll();
    }

    public Optional<String> getUserEmail(UUID userId) {
        return userRepository.findEmailByUserId(userId);
    }
}
