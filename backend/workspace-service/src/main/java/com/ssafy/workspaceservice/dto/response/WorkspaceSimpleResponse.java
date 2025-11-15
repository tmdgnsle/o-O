package com.ssafy.workspaceservice.dto.response;

import com.ssafy.workspaceservice.entity.Workspace;
import com.ssafy.workspaceservice.enums.WorkspaceVisibility;

import java.time.LocalDateTime;
import java.util.List;

public record WorkspaceSimpleResponse(
        Long id,
        String title,
        WorkspaceVisibility visibility,
        LocalDateTime createdAt,
        String thumbnail,
        String startPrompt,
        List<String> profiles
) {
    // 기존 from (다른 API는 이거 그대로 사용)
    public static WorkspaceSimpleResponse from(Workspace w) {
        return from(w, List.of());
    }

    // /workspace/my 에서 쓸 버전
    public static WorkspaceSimpleResponse from(Workspace w, List<String> profiles) {
        return new WorkspaceSimpleResponse(
                w.getId(),
                w.getTitle(),
                w.getVisibility(),
                w.getCreatedAt(),
                w.getThumbnail(),
                w.getStartPrompt(),
                profiles != null ? profiles : List.of()
        );
    }
}