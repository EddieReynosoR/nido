package com.nido.nido_backend.auth;

import com.nido.nido_backend.auth.dto.TokensResponse;
import com.nido.nido_backend.auth.dto.LoginRequest;
import com.nido.nido_backend.refresh_token.dto.RefreshTokenDto;
import com.nido.nido_backend.user.dto.RegisterUserDto;
import com.nido.nido_backend.user.UserEntity;
import com.nido.nido_backend.refresh_token.RefreshTokenService;
import com.nido.nido_backend.shared.util.CookieUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/auth")
@RestController
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;

    public AuthController(AuthService authService, RefreshTokenService refreshTokenService) {
        this.authService = authService;
        this.refreshTokenService = refreshTokenService;
    }

    @PostMapping("/signup")
    public ResponseEntity<UserEntity> register(@RequestBody RegisterUserDto registerUserDto) {
        UserEntity user = authService.signup(registerUserDto);

        return ResponseEntity.ok(user);
    }

    @PostMapping("/login")
    public ResponseEntity<TokensResponse> authenticate(@RequestBody LoginRequest request) {
        RefreshTokenDto refreshTokenDto = authService.signin(request);
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

    @GetMapping("/csrf")
    public CsrfToken csrf(CsrfToken token) {
        return token;
    }
}