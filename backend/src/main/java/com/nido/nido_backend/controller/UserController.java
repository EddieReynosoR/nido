package com.nido.nido_backend.controller;

import com.nido.nido_backend.domain.user.UserEntity;
import com.nido.nido_backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @GetMapping("/welcome")
    public String welcome() {
        return "Welcome this endpoint is not secure";
    }

    @GetMapping("/me")
    public ResponseEntity<UserEntity> getCurrentUser(@AuthenticationPrincipal UserEntity currentUser) {
        return ResponseEntity.ok(currentUser);
    }
}
