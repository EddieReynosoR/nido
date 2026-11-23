package com.nido.nido_backend.auth;

import com.nido.nido_backend.config.SecurityConfig;
import com.nido.nido_backend.refresh_token.RefreshTokenService;
import com.nido.nido_backend.refresh_token.dto.RefreshTokenDto;
import com.nido.nido_backend.shared.util.CookieUtils;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Date;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;

@WebMvcTest(
        controllers = AuthController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {SecurityConfig.class, JwtAuthFilter.class}
        )
)
@AutoConfigureMockMvc(addFilters = false)
@Import(CookieUtils.class)
class AuthControllerSecureCookieTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private RefreshTokenService refreshTokenService;

    @Test
    void loginDoesNotMarkTheRefreshCookieAsSecureWhenSecureCookiesAreNotConfigured() throws Exception {
        RefreshTokenDto tokens = new RefreshTokenDto();
        tokens.setAccessToken("access-token");
        tokens.setRefreshToken("refresh-token");
        tokens.setExpiration(new Date());
        when(authService.signin(any())).thenReturn(tokens);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"user@example.com\",\"password\":\"secret\"}"))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("refreshToken=refresh-token")))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, not(containsString("Secure"))));
    }

    @Test
    void refreshDoesNotMarkTheRenewedCookieAsSecureWhenSecureCookiesAreNotConfigured() throws Exception {
        RefreshTokenDto tokens = new RefreshTokenDto();
        tokens.setAccessToken("new-access-token");
        tokens.setRefreshToken("new-refresh-token");
        tokens.setExpiration(new Date());
        when(refreshTokenService.refreshToken("old-refresh-token")).thenReturn(tokens);

        mockMvc.perform(post("/auth/refresh")
                        .cookie(new Cookie("refreshToken", "old-refresh-token")))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("refreshToken=new-refresh-token")))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, not(containsString("Secure"))));
    }

    @Test
    void logoutDoesNotMarkTheExpiredCookieAsSecureWhenSecureCookiesAreNotConfigured() throws Exception {
        mockMvc.perform(post("/auth/logout")
                        .cookie(new Cookie("refreshToken", "refresh-token")))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("Max-Age=0")))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, not(containsString("Secure"))));
    }

    @Nested
    @TestPropertySource(properties = "app.cookie.secure=true")
    class WhenSecureCookiesAreEnabled {

        @Test
        void loginSetsTheRefreshCookieAsSecure() throws Exception {
            RefreshTokenDto tokens = new RefreshTokenDto();
            tokens.setAccessToken("access-token");
            tokens.setRefreshToken("refresh-token");
            tokens.setExpiration(new Date());
            when(authService.signin(any())).thenReturn(tokens);

            mockMvc.perform(post("/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"email\":\"user@example.com\",\"password\":\"secret\"}"))
                    .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("refreshToken=refresh-token")))
                    .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("Secure")));
        }

        @Test
        void refreshSetsTheRenewedCookieAsSecure() throws Exception {
            RefreshTokenDto tokens = new RefreshTokenDto();
            tokens.setAccessToken("new-access-token");
            tokens.setRefreshToken("new-refresh-token");
            tokens.setExpiration(new Date());
            when(refreshTokenService.refreshToken("old-refresh-token")).thenReturn(tokens);

            mockMvc.perform(post("/auth/refresh")
                            .cookie(new Cookie("refreshToken", "old-refresh-token")))
                    .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("refreshToken=new-refresh-token")))
                    .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("Secure")));
        }

        @Test
        void logoutSendsASecureCookieThatExpiresImmediately() throws Exception {
            mockMvc.perform(post("/auth/logout")
                            .cookie(new Cookie("refreshToken", "refresh-token")))
                    .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("refreshToken=;")))
                    .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("Max-Age=0")))
                    .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("Secure")));
        }
    }

    @Nested
    @ActiveProfiles("production")
    class WhenTheProductionProfileIsActive {

        @Test
        void loginSetsTheRefreshCookieAsSecure() throws Exception {
            RefreshTokenDto tokens = new RefreshTokenDto();
            tokens.setAccessToken("access-token");
            tokens.setRefreshToken("refresh-token");
            tokens.setExpiration(new Date());
            when(authService.signin(any())).thenReturn(tokens);

            mockMvc.perform(post("/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"email\":\"user@example.com\",\"password\":\"secret\"}"))
                    .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("refreshToken=refresh-token")))
                    .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("Secure")));
        }
    }
}
