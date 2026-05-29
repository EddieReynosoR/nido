package com.nido.nido_backend.shared.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;

import java.time.Duration;

public class CookieUtils {
    @Value("{app.cookie.secure:false}")
    private static boolean secure;

    public static ResponseCookie createRefreshTokenCookie(String token) {
        return ResponseCookie.from("refreshToken", token)
            .httpOnly(true)
            .secure(secure)
            .sameSite("Strict")
            .path("/auth")
            .maxAge(Duration.ofDays(7))
            .build();
    }

    public static ResponseCookie deleteRefreshToken() {
        return ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(secure)
                .sameSite("Strict")
                .path("/auth")
                .maxAge(0)
                .build();
    }
}
