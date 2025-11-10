package com.ssafy.workspaceservice.dto.response;

import com.ssafy.workspaceservice.entity.Workspace;
import com.ssafy.workspaceservice.enums.WorkspaceVisibility;

import java.time.LocalDateTime;

public record WorkspaceSimpleResponse(
        Long id,
        String title,
        WorkspaceVisibility visibility,
        LocalDateTime createdAt,
        String thumbnail
) {
    public static WorkspaceSimpleResponse from(Workspace w) {
        return new WorkspaceSimpleResponse(
                w.getId(), w.getTitle(), w.getVisibility(), w.getCreatedAt(), w.getThumbnail()
        );
    }
}
// 목록 표시에 필요한 최소 정보. 최신순 조회에서 가벼운 응답