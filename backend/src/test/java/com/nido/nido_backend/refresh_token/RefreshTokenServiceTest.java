package com.nido.nido_backend.refresh_token;

import com.nido.nido_backend.auth.JwtService;
import com.nido.nido_backend.shared.exception.AccountUnavailableException;
import com.nido.nido_backend.user.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;
    @Mock
    private JwtService jwtService;
    @Mock
    private UserService userService;

    @InjectMocks
    private RefreshTokenService refreshTokenService;

    @Test
    void throwsAccountUnavailableWhenTheRefreshTokenUserIsSoftDeleted() {
        UUID userId = UUID.randomUUID();
        RefreshTokenEntity entity = new RefreshTokenEntity();
        UUID refreshTokenId = UUID.randomUUID();
        entity.setRefreshTokenId(refreshTokenId);
        entity.setUserId(userId);
        entity.setExpiresAt(LocalDateTime.now().plusDays(1));

        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(entity));
        when(refreshTokenRepository.deleteByRefreshTokenId(refreshTokenId)).thenReturn(1);
        when(userService.getUserEmail(userId)).thenReturn(Optional.empty());

        assertThrows(AccountUnavailableException.class, () -> refreshTokenService.refreshToken("raw-token"));

        verify(refreshTokenRepository, never()).save(any());
        verifyNoInteractions(jwtService);
    }
}
