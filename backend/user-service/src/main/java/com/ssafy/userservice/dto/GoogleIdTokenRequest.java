package com.ssafy.userservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class GoogleIdTokenRequest {

    @NotBlank(message = "ID token is required")
    private String idToken;

    @NotBlank(message = "Platform is required")
    private String platform;
}
