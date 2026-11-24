package com.nido.nido_backend.auth;

import com.nido.nido_backend.shared.exception.AccountUnavailableException;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import com.nido.nido_backend.user.UserEntity;
import com.nido.nido_backend.user.UserRepository;
import org.jspecify.annotations.NonNull;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    public JwtAuthFilter(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authHeader.substring(7);
        final String userId;

        try {
            userId = jwtService.extractUserId(token);
        } catch (ExpiredJwtException e) {
            writeUnauthorized(response, "expired_token", "The access token expired");
            return;
        } catch (JwtException | IllegalArgumentException e) {
            writeUnauthorized(response, "invalid_token", "The access token is invalid");
            return;
        }

        if (userId == null || SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            UserEntity user = userRepository.findByUserId(UUID.fromString(userId))
                    .orElseThrow(AccountUnavailableException::new);

            if (jwtService.validateToken(token, user)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        user,
                        null,
                        user.getAuthorities());

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        catch (AccountUnavailableException e) {
            writeUnauthorized(response, "account_unavailable", "The account is no longer available");
            return;
        }
        catch (IllegalArgumentException e) {
            writeUnauthorized(response, "invalid_token", "The access token is invalid");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private void writeUnauthorized(HttpServletResponse response, String error, String description) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setHeader(HttpHeaders.WWW_AUTHENTICATE,
                "Bearer error=\"" + error + "\", error_description=\"" + description + "\"");
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("""
            {"error":"%s","message":"%s"}""".formatted(error, description));
    }
}
