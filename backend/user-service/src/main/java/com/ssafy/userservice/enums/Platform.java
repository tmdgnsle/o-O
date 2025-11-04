package com.ssafy.userservice.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 플랫폼 유형을 정의하는 Enum
 */
@Getter
@RequiredArgsConstructor
public enum Platform {
    WEB("web"),
    APP("app");

    private final String value;

    /**
     * 문자열 값으로부터 Platform을 찾습니다.
     *
     * @param value 플랫폼 문자열 ("web" or "app")
     * @return Platform
     * @throws IllegalArgumentException 유효하지 않은 값
     */
    public static Platform fromString(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Platform cannot be null or blank");
        }

        for (Platform platform : Platform.values()) {
            if (platform.value.equalsIgnoreCase(value)) {
                return platform;
            }
        }

        throw new IllegalArgumentException("Invalid platform: " + value + ". Allowed values: web, app");
    }
}
