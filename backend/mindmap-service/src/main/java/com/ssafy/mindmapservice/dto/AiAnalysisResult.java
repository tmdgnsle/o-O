package com.ssafy.mindmapservice.dto;

import java.util.List;

/**
 * AI 서버에서 분석 결과를 받을 때 사용하는 DTO
 */
public record AiAnalysisResult(
        Long workspaceId,
        Long nodeId,                // INITIAL: 요청한 노드 ID, CONTEXTUAL: 부모 노드 ID
        String analysisType,        // "INITIAL" or "CONTEXTUAL"
        List<AiNodeDto> nodes,      // AI가 생성한 노드 배열 (INITIAL: 6개, CONTEXTUAL: 3개)
        String status               // "SUCCESS" or "FAILED"
) {}
