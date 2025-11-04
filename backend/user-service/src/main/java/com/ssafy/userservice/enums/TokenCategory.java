package com.ssafy.userservice.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum TokenCategory {
    ACCESS("access"),
    REFRESH("refresh");

    private final String value;

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
