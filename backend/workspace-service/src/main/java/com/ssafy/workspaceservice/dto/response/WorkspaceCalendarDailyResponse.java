package com.ssafy.workspaceservice.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.util.List;

@Schema(description = "날짜별 워크스페이스 목록")
public record WorkspaceCalendarDailyResponse(
        @Schema(description = "날짜", example = "2025-01-15")
        LocalDate date,

        @Schema(description = "해당 날짜에 생성된 워크스페이스 목록")
        List<WorkspaceCalendarItemResponse> workspaces
) {
    public static WorkspaceCalendarDailyResponse of(LocalDate date, List<WorkspaceCalendarItemResponse> workspaces) {
        return new WorkspaceCalendarDailyResponse(date, workspaces);
    }
}
