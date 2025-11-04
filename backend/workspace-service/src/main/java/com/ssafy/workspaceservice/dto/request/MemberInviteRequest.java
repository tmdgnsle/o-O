package com.ssafy.workspaceservice.dto.request;

import jakarta.validation.constraints.NotBlank;

public record MemberInviteRequest(
        @NotBlank String email   // 또는 링크 발송 대상. 이후 확장 가능
) {}
// 이메일 초대 요청