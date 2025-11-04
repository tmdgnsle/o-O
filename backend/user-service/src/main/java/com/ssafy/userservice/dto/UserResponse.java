package com.ssafy.userservice.dto;

import com.ssafy.userservice.entity.User;

public record UserResponse(
        String email,
        String nickname,
        String profileImage
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getEmail(),
                user.getNickname(),
                user.getProfileImage()
        );
    }
}
