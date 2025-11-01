package com.ssafy.userservice.util;

import org.springframework.http.ResponseCookie;

public class CookieUtil {

    private static final String REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
    private static final String COOKIE_PATH = "/";

    public static ResponseCookie createRefreshTokenCookie(String value, int maxAge) {
        return ResponseCookie.from(REFRESH_TOKEN_COOKIE_NAME, value)
                .maxAge(maxAge)
                .path(COOKIE_PATH)
                .httpOnly(true)
                // .secure(true)  // HTTPS 환경에서 활성화
                .build();
    }

    public static ResponseCookie deleteRefreshTokenCookie() {
        return createRefreshTokenCookie("", 0);
    }
}
