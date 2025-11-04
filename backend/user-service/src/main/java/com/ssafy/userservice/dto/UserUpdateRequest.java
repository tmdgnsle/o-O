package com.ssafy.userservice.dto;

/**
 * 사용자 정보 수정 요청 DTO
 */
public record UserUpdateRequest(
        String nickname,
        String profileImage
) {
}
