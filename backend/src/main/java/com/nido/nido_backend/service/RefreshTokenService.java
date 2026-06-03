package com.nido.nido_backend.service;

import com.nido.nido_backend.domain.LoginResponse;
import com.nido.nido_backend.domain.RefreshTokenDto;
import com.nido.nido_backend.domain.refresh_token.RefreshTokenEntity;
import com.nido.nido_backend.shared.exception.RefreshTokenNotValidException;
import com.nido.nido_backend.repository.RefreshTokenRepository;
import com.nido.nido_backend.shared.exception.UserWithoutEmailException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserService userService;
    private final JwtService jwtService;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository, UserService userService, JwtService jwtService) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userService = userService;
        this.jwtService = jwtService;
    }

    public String createRefreshToken(UUID userId) {
        RefreshTokenEntity refreshToken = new RefreshTokenEntity();

        refreshToken.setUserId(userId);
        refreshToken.setTokenHash(generateRefreshToken());
        refreshToken.setExpiresAt(LocalDateTime.now().plusDays(7));

        refreshTokenRepository.save(refreshToken);

        return refreshToken.getTokenHash();
    }

    private String generateRefreshToken() {
        byte[] randomBytes = new byte[32];
        new SecureRandom().nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    public RefreshTokenEntity findByTokenHash(String tokenHash) {
        return refreshTokenRepository.findByTokenHash(tokenHash.trim())
                .orElseThrow(RefreshTokenNotValidException::new);
    }

    @Transactional
    public void deleteToken(String tokenHash) {
        RefreshTokenEntity refreshToken = findByTokenHash(tokenHash);
        refreshTokenRepository.deleteByTokenHash(refreshToken.getTokenHash());
    }

    @Transactional
    public RefreshTokenDto refreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank())
            throw new RefreshTokenNotValidException();

        RefreshTokenEntity token = findByTokenHash(refreshToken);

        if (token.getExpiresAt().isBefore(LocalDateTime.now()))
            throw new RefreshTokenNotValidException();

        UUID userId = token.getUserId();

        Optional<String> userEmail = userService.getUserEmail(userId);

        if (userEmail.isEmpty())
            throw new UserWithoutEmailException();

        deleteToken(refreshToken);
        String accessToken = jwtService.generateToken(userEmail.get());
        String newRefreshToken = createRefreshToken(userId);

        RefreshTokenDto refreshTokenDto = new RefreshTokenDto();
        refreshTokenDto.setAccessToken(accessToken);
        refreshTokenDto.setExpiration(jwtService.extractExpiration(accessToken));
        refreshTokenDto.setRefreshToken(newRefreshToken);

        return refreshTokenDto;
    }
}
