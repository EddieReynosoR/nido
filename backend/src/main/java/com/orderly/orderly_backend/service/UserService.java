package com.orderly.orderly_backend.service;

import com.orderly.orderly_backend.domain.user.UserEntity;
import com.orderly.orderly_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserEntity> getUsers() {
        return userRepository.findAll();
    }
}
