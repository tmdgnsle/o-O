package com.ssafy.workspaceservice.dto.response;

import com.ssafy.workspaceservice.entity.Workspace;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "캘린더 워크스페이스 항목")
public record WorkspaceCalendarItemResponse(
        @Schema(description = "워크스페이스 ID", example = "1")
        Long workspaceId,

        @Schema(description = "랜덤 노드 목록 (최대 3개)")
        List<MindmapNodeDto> nodes
) {
    public static WorkspaceCalendarItemResponse of(Workspace workspace, List<MindmapNodeDto> nodes) {
        return new WorkspaceCalendarItemResponse(
                workspace.getId(),
                nodes
        );
    }
}
