package com.nido.nido_backend.service;

import com.nido.nido_backend.domain.RefreshTokenDto;
import com.nido.nido_backend.domain.refresh_token.RefreshTokenEntity;
import com.nido.nido_backend.shared.exception.RefreshTokenNotValidException;
import com.nido.nido_backend.repository.RefreshTokenRepository;
import com.nido.nido_backend.shared.exception.UserWithoutEmailException;
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
    private final UserService userService;
    private final JwtService jwtService;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository, UserService userService, JwtService jwtService) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userService = userService;
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

    public RefreshTokenEntity findByTokenHash(String tokenHash) {
        return refreshTokenRepository.findByTokenHash(tokenHash.trim())
                .orElseThrow(RefreshTokenNotValidException::new);
    }

    public Optional<RefreshTokenEntity> findByUserId(UUID userId) {
        return refreshTokenRepository.findByUserId(userId);
    }

    @Transactional
    public void deleteToken(String tokenHash) {
        if (tokenHash == null || tokenHash.isBlank())
            return;

        refreshTokenRepository.deleteByTokenHash(tokenHash);
    }

    @Transactional
    public RefreshTokenDto refreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank())
            throw new RefreshTokenNotValidException();

        String tokenHash = hashToken(refreshToken);
        RefreshTokenEntity token = findByTokenHash(tokenHash);

        if (token.getExpiresAt().isBefore(LocalDateTime.now()))
            throw new RefreshTokenNotValidException();

        UUID userId = token.getUserId();
        Optional<String> userEmail = userService.getUserEmail(userId);

        if (userEmail.isEmpty())
            throw new UserWithoutEmailException();

        deleteToken(tokenHash);
        String accessToken = jwtService.generateToken(userEmail.get());
        String newRefreshToken = createRefreshToken(userId);

        RefreshTokenDto refreshTokenDto = new RefreshTokenDto();
        refreshTokenDto.setAccessToken(accessToken);
        refreshTokenDto.setExpiration(jwtService.extractExpiration(accessToken));
        refreshTokenDto.setRefreshToken(newRefreshToken);

        return refreshTokenDto;
    }

    @Transactional
    public void deleleTokenByUserId(UUID userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }
}
