package com.ssafy.workspaceservice.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "마인드맵 노드 정보")
public record MindmapNodeDto(
        @Schema(description = "노드 ID", example = "1")
        Long nodeId,

        @Schema(description = "키워드", example = "Spring Boot")
        String keyword
) {
}
