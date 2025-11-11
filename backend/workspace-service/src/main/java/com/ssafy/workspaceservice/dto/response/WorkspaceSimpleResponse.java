package com.ssafy.workspaceservice.dto.response;

import com.ssafy.workspaceservice.entity.Workspace;
import com.ssafy.workspaceservice.enums.WorkspaceVisibility;

import java.time.LocalDateTime;

public record WorkspaceSimpleResponse(
        Long id,
        String title,
        WorkspaceVisibility visibility,
        LocalDateTime createdAt,
        String thumbnail,
        String startPrompt
) {
    public static WorkspaceSimpleResponse from(Workspace w) {
        return new WorkspaceSimpleResponse(
                w.getId(),
                w.getTitle(),
                w.getVisibility(),
                w.getCreatedAt(),
                w.getThumbnail(),
                w.getStartPrompt()
        );
    }
}