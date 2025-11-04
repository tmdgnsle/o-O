package com.ssafy.userservice.util;

import org.springframework.http.ResponseCookie;

public class CookieUtil {

    private static final String REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
    private static final String COOKIE_PATH = "/";
    private static final int DEFAULT_REFRESH_TOKEN_MAX_AGE = 604800; // 7일 (초 단위)

    /**
     * Refresh Token 쿠키를 생성합니다.
     *
     * @param value Refresh Token 값
     * @param maxAge 쿠키 유효 시간 (초 단위)
     * @return ResponseCookie
     */
    public static ResponseCookie createRefreshTokenCookie(String value, int maxAge) {
        return ResponseCookie.from(REFRESH_TOKEN_COOKIE_NAME, value)
                .maxAge(maxAge)
                .path(COOKIE_PATH)
                .httpOnly(true)
                // .secure(true)  // HTTPS 환경에서 활성화
                .build();
    }

    /**
     * 기본 유효 시간(7일)으로 Refresh Token 쿠키를 생성합니다.
     *
     * @param value Refresh Token 값
     * @return ResponseCookie
     */
    public static ResponseCookie createRefreshTokenCookie(String value) {
        return createRefreshTokenCookie(value, DEFAULT_REFRESH_TOKEN_MAX_AGE);
    }

    /**
     * Refresh Token 쿠키를 삭제합니다.
     *
     * @return ResponseCookie
     */
    public static ResponseCookie deleteRefreshTokenCookie() {
        return createRefreshTokenCookie("", 0);
    }
}
