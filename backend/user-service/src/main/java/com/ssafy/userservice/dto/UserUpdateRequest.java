package com.ssafy.userservice.dto;

public record UserUpdateRequest(
        String nickname,
        String profileImage
) {
}
