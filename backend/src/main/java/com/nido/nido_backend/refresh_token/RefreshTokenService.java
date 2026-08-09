package com.nido.nido_backend.refresh_token;

import com.nido.nido_backend.auth.JwtService;
import com.nido.nido_backend.refresh_token.dto.RefreshTokenDto;
import com.nido.nido_backend.shared.exception.NoRowsAffectedException;
import com.nido.nido_backend.shared.exception.RefreshTokenExpiredException;
import com.nido.nido_backend.shared.exception.RefreshTokenInvalidException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository, JwtService jwtService) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtService = jwtService;
    }

    public String createRefreshToken(UUID userId) {
        RefreshTokenEntity refreshToken = new RefreshTokenEntity();

        String rawToken = generateRefreshToken();
        String tokenHash = hashToken(rawToken);

        refreshToken.setUserId(userId);
        refreshToken.setTokenHash(tokenHash);
        refreshToken.setExpiresAt(LocalDateTime.now().plusDays(7));

        refreshTokenRepository.save(refreshToken);

        return rawToken;
    }

    private String generateRefreshToken() {
        byte[] randomBytes = new byte[32];
        new SecureRandom().nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available.", e);
        }
    }

    public Optional<RefreshTokenEntity> findByUserId(UUID userId) {
        return refreshTokenRepository.findByUserId(userId);
    }

    @Transactional
    public void deleteToken(String rawToken) {
        if (rawToken == null || rawToken.isBlank())
            return;

        String tokenHash = hashToken(rawToken);

        if (refreshTokenRepository.deleteByTokenHash(tokenHash) == 0)
            throw new NoRowsAffectedException("No refresh token was deleted.");
    }

    @Transactional
    public RefreshTokenDto refreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank())
            throw new RefreshTokenInvalidException();

        RefreshTokenEntity entity = refreshTokenRepository
                .findByTokenHash(hashToken(refreshToken))
                .orElseThrow(RefreshTokenInvalidException::new);

        if (entity.getExpiresAt().isBefore(LocalDateTime.now()))
            throw new RefreshTokenExpiredException();

        if (refreshTokenRepository.deleteByRefreshTokenId(entity.getRefreshTokenId()) == 0)
            throw new NoRowsAffectedException("No refresh token was deleted.");

        UUID userId = entity.getUserId();

        String accessToken = jwtService.generateToken(userId);

        RefreshTokenDto dto = new RefreshTokenDto();
        dto.setAccessToken(accessToken);
        dto.setExpiration(jwtService.extractExpiration(accessToken));
        dto.setRefreshToken(createRefreshToken(userId));
        return dto;
    }

    @Transactional
    public void deleleTokenByUserId(UUID userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }
}
