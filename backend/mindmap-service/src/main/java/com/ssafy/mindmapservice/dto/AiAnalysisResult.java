package com.ssafy.mindmapservice.dto;

/**
 * AI 서버에서 분석 결과를 받을 때 사용하는 DTO
 */
public record AiAnalysisResult(
        Long workspaceId,
        Long nodeId,
        String aiSummary,       // AI 분석 결과 텍스트
        String status           // SUCCESS, FAILED
) {}
