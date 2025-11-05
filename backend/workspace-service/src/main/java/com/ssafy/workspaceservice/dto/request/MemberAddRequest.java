package com.ssafy.workspaceservice.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

public record MemberAddRequest(
        @NotNull Long userId,
        @NotBlank String role,        // OWNER/ADMIN/MEMBER/VIEWER
        String pointerColor
) { }
// 관리자/소유자가 멤버를 직접 추가할 때 사용.
