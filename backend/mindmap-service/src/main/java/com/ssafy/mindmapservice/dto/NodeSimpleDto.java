package com.ssafy.mindmapservice.dto;

import com.ssafy.mindmapservice.domain.MindmapNode;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 노드 간단 정보 DTO
 * 캘린더 등에서 경량화된 노드 정보를 전달하기 위한 DTO
 */
@Schema(description = "노드 간단 정보")
public record NodeSimpleDto(
        @Schema(description = "노드 ID", example = "1")
        Long nodeId,

        @Schema(description = "키워드", example = "Spring Boot")
        String keyword
) {
    public static NodeSimpleDto from(MindmapNode node) {
        return new NodeSimpleDto(
                node.getNodeId(),
                node.getKeyword()
        );
    }
}
