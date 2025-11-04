package com.ssafy.userservice.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Google ID Token 로그인 요청 DTO
 */
public record GoogleIdTokenRequest(
        @NotBlank(message = "ID token is required")
        String idToken,

        @NotBlank(message = "Platform is required")
        String platform
) {
}
