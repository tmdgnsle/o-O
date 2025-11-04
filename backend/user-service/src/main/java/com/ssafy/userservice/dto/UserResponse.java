package com.ssafy.userservice.dto;

import com.ssafy.userservice.entity.User;

/**
 * 사용자 정보 응답 DTO
 */
public record UserResponse(
        String email,
        String nickname,
        String profileImage
) {
    /**
     * User 엔티티로부터 UserResponse를 생성합니다.
     *
     * @param user User 엔티티
     * @return UserResponse
     */
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getEmail(),
                user.getNickname(),
                user.getProfileImage()
        );
    }
}
