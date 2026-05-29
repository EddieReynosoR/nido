package com.nido.nido_backend.controller;

import com.nido.nido_backend.domain.LoginResponse;
import com.nido.nido_backend.domain.LoginUserDto;
import com.nido.nido_backend.domain.RegisterUserDto;
import com.nido.nido_backend.domain.user.UserEntity;
import com.nido.nido_backend.service.AuthenticationService;
import com.nido.nido_backend.service.JwtService;
import com.nido.nido_backend.service.RefreshTokenService;
import com.nido.nido_backend.shared.util.CookieUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
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

        String accessToken = jwtService.generateToken(user.getEmail());
        String refreshToken = refreshTokenService.createRefreshToken(user.getUserId());

        LoginResponse response = new LoginResponse();
        response.setToken(accessToken);
        response.setExpiration(jwtService.extractExpiration(accessToken));

        ResponseCookie cookie = CookieUtils.createRefreshTokenCookie(refreshToken);

        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, cookie.toString())
            .body(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @CookieValue(value = "refreshToken", required = false) String refreshToken
    ) {
        if (refreshToken != null)
            refreshTokenService.revokeToken(refreshToken);

        ResponseCookie cookie = CookieUtils.deleteRefreshToken();

        return ResponseEntity.noContent()
            .header(HttpHeaders.SET_COOKIE, cookie.toString())
            .build();
    }
}