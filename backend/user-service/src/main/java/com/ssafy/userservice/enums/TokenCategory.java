package com.ssafy.userservice.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * JWT 토큰의 카테고리를 정의하는 Enum
 */
@Getter
@RequiredArgsConstructor
public enum TokenCategory {
    ACCESS("access"),
    REFRESH("refresh");

    private final String value;

    /**
     * 문자열 값으로부터 TokenCategory를 찾습니다.
     *
     * @param value 토큰 카테고리 문자열 ("access" or "refresh")
     * @return TokenCategory
     * @throws IllegalArgumentException 유효하지 않은 값
     */
    public static TokenCategory fromString(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Token category cannot be null or blank");
        }

        for (TokenCategory category : TokenCategory.values()) {
            if (category.value.equalsIgnoreCase(value)) {
                return category;
            }
        }

        throw new IllegalArgumentException("Invalid token category: " + value + ". Allowed values: access, refresh");
    }
}
