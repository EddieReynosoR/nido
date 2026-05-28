package com.nido.nido_backend.controller;

import com.nido.nido_backend.domain.LoginResponse;
import com.nido.nido_backend.domain.LoginUserDto;
import com.nido.nido_backend.domain.RegisterUserDto;
import com.nido.nido_backend.domain.user.UserEntity;
import com.nido.nido_backend.service.AuthenticationService;
import com.nido.nido_backend.service.JwtService;
import com.nido.nido_backend.service.RefreshTokenService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;

@RequestMapping("/auth")
@RestController
public class AuthController {

    private final JwtService jwtService;
    private final AuthenticationService authenticationService;
    private final RefreshTokenService refreshTokenService;

    public AuthController(JwtService jwtService, AuthenticationService authenticationService, RefreshTokenService refreshTokenService) {
        this.jwtService = jwtService;
        this.authenticationService = authenticationService;
        this.refreshTokenService = refreshTokenService;
    }

    @PostMapping("/signup")
    public ResponseEntity<UserEntity> register(@RequestBody RegisterUserDto registerUserDto) {
        UserEntity user = authenticationService.signup(registerUserDto);

        return ResponseEntity.ok(user);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> authenticate(@RequestBody LoginUserDto loginUserDto) {
        UserEntity user = authenticationService.authenticate(loginUserDto);

        String token = jwtService.generateToken(user.getEmail());

        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setExpiration(jwtService.extractExpiration(token));
        response.setRefreshToken(refreshTokenService.createRefreshToken(user.getUserId()));

        return ResponseEntity.ok(response);
    }
}
