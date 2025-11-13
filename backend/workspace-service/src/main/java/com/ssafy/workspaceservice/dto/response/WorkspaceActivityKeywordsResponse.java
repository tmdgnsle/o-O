package com.ssafy.workspaceservice.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "특정 날짜의 키워드 응답")
public record WorkspaceActivityKeywordsResponse(
        @Schema(description = "조회 날짜 (yyyy-MM-dd)", example = "2025-11-05")
        String date,

        @Schema(description = "키워드 목록 (최대 10개)", example = "[\"AI 기능 개선\", \"Redis TTL 설계\"]")
        List<String> keywords
) {
    public static WorkspaceActivityKeywordsResponse of(String date, List<String> keywords) {
        return new WorkspaceActivityKeywordsResponse(date, keywords);
    }
}
