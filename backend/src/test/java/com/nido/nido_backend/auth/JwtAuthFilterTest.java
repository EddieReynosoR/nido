package com.nido.nido_backend.auth;

import com.nido.nido_backend.shared.exception.AccountUnavailableException;
import com.nido.nido_backend.user.UserRepository;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtAuthFilterTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private FilterChain filterChain;

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void respondsWithAccountUnavailableWhenTheTokenUserIsNotAvailable() throws Exception {
        String userId = UUID.randomUUID().toString();
        when(jwtService.extractUserId("valid-token")).thenReturn(userId);
        when(userRepository.findByUserId(UUID.fromString(userId))).thenThrow(new AccountUnavailableException());

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer valid-token");
        MockHttpServletResponse response = new MockHttpServletResponse();

        new JwtAuthFilter(userRepository, jwtService).doFilter(request, response, filterChain);

        assertEquals(401, response.getStatus());
        assertEquals("{\"error\":\"account_unavailable\",\"message\":\"The account is no longer available\"}",
                response.getContentAsString());
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verifyNoInteractions(filterChain);
    }
}
