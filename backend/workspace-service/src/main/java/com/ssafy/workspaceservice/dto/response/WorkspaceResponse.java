package com.ssafy.workspaceservice.dto.response;

import com.ssafy.workspaceservice.entity.Workspace;
import com.ssafy.workspaceservice.enums.WorkspaceType;
import com.ssafy.workspaceservice.enums.WorkspaceVisibility;

import java.time.LocalDateTime;

public record WorkspaceResponse(
        Long id,
        WorkspaceType type,
        WorkspaceVisibility visibility,
        String subject,
        String thumbnail,
        LocalDateTime createdAt
) {
    public static WorkspaceResponse from(Workspace w) {
        return new WorkspaceResponse(
                w.getId(), w.getType(), w.getVisibility(),
                w.getSubject(), w.getThumbnail(), w.getCreatedAt()
        );
    }
}
// 워크스페이스 기본 정보. 엔티티 그대로 노출하지 않고 계약 전용 DTO로 반환
