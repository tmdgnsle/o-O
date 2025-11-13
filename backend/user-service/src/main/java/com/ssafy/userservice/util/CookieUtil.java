package com.ssafy.userservice.util;

import org.springframework.http.ResponseCookie;

public class CookieUtil {

    private static final String REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
    private static final String COOKIE_PATH = "/";
    private static final int DEFAULT_REFRESH_TOKEN_MAX_AGE = 604800; // 초 단위 (7일)

    public static ResponseCookie createRefreshTokenCookie(String value, int maxAge) {
        return ResponseCookie.from(REFRESH_TOKEN_COOKIE_NAME, value)
                .maxAge(maxAge)
                .path(COOKIE_PATH)
                .httpOnly(true)
                .secure(true)  // HTTPS 환경에서 활성화
                .sameSite("None")  // 크로스 사이트 요청 허용
                .build();
    }

    public static ResponseCookie createRefreshTokenCookie(String value) {
        return ResponseCookie.from(REFRESH_TOKEN_COOKIE_NAME, value)
                .maxAge(DEFAULT_REFRESH_TOKEN_MAX_AGE)
                .path(COOKIE_PATH)
                .httpOnly(true)
                .secure(true)  // HTTPS 환경에서 활성화
                .sameSite("None")  // 크로스 사이트 요청 허용
                .build();
    }

    public static ResponseCookie deleteRefreshTokenCookie() {
        return createRefreshTokenCookie("", 0);
    }
}
