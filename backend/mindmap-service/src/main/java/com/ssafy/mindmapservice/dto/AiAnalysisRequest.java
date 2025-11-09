package com.ssafy.mindmapservice.dto;

/**
 * 클라이언트에서 AI 분석을 요청할 때 사용하는 DTO
 */
public record AiAnalysisRequest(
        Long workspaceId,
        Long nodeId,
        String contentUrl,      // 이미지/영상 URL
        String contentType,     // IMAGE, VIDEO
        String prompt,          // 사용자 프롬프트
        String userId           // 요청한 사용자 ID
) {}
