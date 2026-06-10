package com.nido.nido_backend.user;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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
