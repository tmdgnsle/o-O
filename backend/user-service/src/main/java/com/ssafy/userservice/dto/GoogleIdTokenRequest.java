package com.ssafy.userservice.dto;

import jakarta.validation.constraints.NotBlank;

public record GoogleIdTokenRequest(
        @NotBlank(message = "ID token is required")
        String idToken,

        @NotBlank(message = "Platform is required")
        String platform
) {
}
