package com.ssafy.workspaceservice.dto.response;

import com.ssafy.workspaceservice.entity.Workspace;

import java.time.LocalDateTime;

public record WorkspaceDetailResponse(
        Long id,
        String mode,
        String visibility,
        String subject,
        String thumbnail,
        LocalDateTime createdAt,
        boolean isMember,     // 요청자 기준 입장 여부
        String myRole,        // OWNER/ADMIN/... (비회원이면 null)
        Long memberCount
) {
    public static WorkspaceDetailResponse of(Workspace w, boolean isMember, String myRole, Long memberCount) {
        return new WorkspaceDetailResponse(
                w.getId(), w.getMode(), w.getVisibility(), w.getSubject(),
                w.getThumbnail(), w.getCreatedAt(), isMember, myRole, memberCount
        );
    }
}
// 입장 판단 및 내 역할 표시까지 포함한 상세 응답