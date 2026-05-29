package com.nido.nido_backend.service;

import com.nido.nido_backend.domain.refresh_token.RefreshTokenEntity;
import com.nido.nido_backend.shared.exception.TokenNotFoundException;
import com.nido.nido_backend.repository.RefreshTokenRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
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

    @Transactional
    public void revokeToken(String tokenHash) {
        RefreshTokenEntity refreshToken = refreshTokenRepository.findByTokenHash(tokenHash.trim())
                .orElseThrow(() -> new TokenNotFoundException("Refresh token not found"));

        refreshToken.setRevokedAt(LocalDateTime.now());
    }
}
