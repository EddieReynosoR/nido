package com.nido.nido_backend.user;

import com.nido.nido_backend.user.dto.RegisterUserDto;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.util.*;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder encoder;

    public UserService(UserRepository userRepository, PasswordEncoder encoder) {

        this.userRepository = userRepository;
        this.encoder = encoder;
    }

    public List<UserEntity> getUsers() {
        return userRepository.findAll();
    }

    public Optional<String> getUserEmail(UUID userId) {
        return userRepository.findEmailByUserId(userId);
    }

    public UserEntity findByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new NoSuchElementException("No user found associated with the provided email address."));
    }

    public UserEntity saveUser(RegisterUserDto input) {
        UserEntity user = new UserEntity();

        user.setFirstName(input.getFirstName());
        user.setLastName(input.getLastName());
        user.setEmail(input.getEmail());
        user.setPassword(encoder.encode(input.getPassword()));

        user.setActive(true);
        user.setCreatedAt(new Date().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime());
        user.setUpdatedAt(new Date().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime());

        return userRepository.save(user);
    }
}
