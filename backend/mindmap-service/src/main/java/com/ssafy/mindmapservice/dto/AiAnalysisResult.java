package com.ssafy.mindmapservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

/**
 * AI 서버에서 분석 결과를 받을 때 사용하는 DTO
 * INITIAL: aiSummary 포함, nodeId는 null
 * CONTEXTUAL: nodeId 포함, aiSummary는 null
 */
@Schema(description = "AI 분석 결과 DTO (Kafka 응답용)")
public record AiAnalysisResult(

        @Schema(description = "워크스페이스 ID", example = "123", required = true)
        Long workspaceId,

        @Schema(description = "노드 ID (CONTEXTUAL 전용, 확장된 부모 노드 ID)", example = "15", nullable = true)
        Long nodeId,

        @Schema(description = "AI 분석 요약 (INITIAL 전용)", example = "'고기'와 관련된 다양한 아이디어를 분류했습니다.", nullable = true)
        String aiSummary,

        @Schema(description = "AI가 생성한 노드 배열 (INITIAL: 6개, CONTEXTUAL: 3개)", required = true)
        List<AiNodeDto> nodes,

        @Schema(description = "처리 상태", example = "SUCCESS", allowableValues = {"SUCCESS", "FAILED"}, required = true)
        String status
) {}
