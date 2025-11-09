package com.ssafy.mindmapservice.dto;

import java.util.List;

/**
 * 클라이언트에서 AI 분석을 요청할 때 사용하는 DTO
 */
public record AiAnalysisRequest(
        Long workspaceId,
        Long nodeId,                        // INITIAL: 첫 노드 ID, CONTEXTUAL: 부모 노드 ID
        String contentUrl,                  // 이미지/영상 URL
        String contentType,                 // IMAGE, VIDEO, TEXT
        String prompt,                      // 사용자 프롬프트
        String userId,                      // 요청한 사용자 ID
        String analysisType,                // "INITIAL" or "CONTEXTUAL"
        List<ParentContextDto> parentContext // CONTEXTUAL일 때만 사용 (조상 경로)
) {}
