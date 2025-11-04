package com.ssafy.workspaceservice.dto.response;

import com.ssafy.workspaceservice.entity.Workspace;

import java.time.LocalDateTime;

public record WorkspaceResponse(
        Long id,
        String mode,
        String visibility,
        String subject,
        String thumbnail,
        LocalDateTime createdAt
) {
    public static WorkspaceResponse from(Workspace w) {
        return new WorkspaceResponse(
                w.getId(), w.getMode(), w.getVisibility(),
                w.getSubject(), w.getThumbnail(), w.getCreatedAt()
        );
    }
}
// 워크스페이스 기본 정보. 엔티티 그대로 노출하지 않고 계약 전용 DTO로 반환
