package com.ssafy.workspaceservice.dto.response;

import com.ssafy.workspaceservice.entity.Workspace;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "캘린더 워크스페이스 항목")
public record WorkspaceCalendarItemResponse(
        @Schema(description = "워크스페이스 ID", example = "1")
        Long workspaceId,

        @Schema(description = "워크스페이스 제목", example = "프로젝트 A")
        String title
) {
    public static WorkspaceCalendarItemResponse from(Workspace workspace) {
        return new WorkspaceCalendarItemResponse(
                workspace.getId(),
                workspace.getTitle()
        );
    }
}
