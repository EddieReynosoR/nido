package com.nido.nido_backend.controller;

import com.nido.nido_backend.domain.TokensResponse;
import com.nido.nido_backend.domain.LoginRequest;
import com.nido.nido_backend.domain.RefreshTokenDto;
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
    public ResponseEntity<TokensResponse> authenticate(@RequestBody LoginRequest request) {
        RefreshTokenDto refreshTokenDto = authenticationService.signin(request);
        ResponseCookie cookie = CookieUtils.createRefreshTokenCookie(refreshTokenDto.getRefreshToken());

        TokensResponse response = new TokensResponse(refreshTokenDto.getAccessToken(), refreshTokenDto.getExpiration());

        return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, cookie.toString())
            .body(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokensResponse> refresh(
            @CookieValue(value = "refreshToken", required = false) String refreshToken
    ) {
        RefreshTokenDto refreshTokenDto = refreshTokenService.refreshToken(refreshToken);
        ResponseCookie cookie = CookieUtils.createRefreshTokenCookie(refreshTokenDto.getRefreshToken());

        TokensResponse response = new TokensResponse(refreshTokenDto.getAccessToken(), refreshTokenDto.getExpiration());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @CookieValue(value = "refreshToken") String refreshToken
    ) {
        refreshTokenService.deleteToken(refreshToken);

        ResponseCookie cookie = CookieUtils.deleteRefreshToken();

        return ResponseEntity.noContent()
            .header(HttpHeaders.SET_COOKIE, cookie.toString())
            .build();
    }
}