package com.ssafy.mindmapservice.dto;

/**
 * 부모 노드의 컨텍스트 정보
 * CONTEXTUAL 분석 시 조상 노드들의 keyword와 memo를 AI에게 전달하기 위해 사용합니다.
 */
public record ParentContextDto(
    Long nodeId,        // 노드 ID
    String keyword,     // 노드 키워드
    String memo         // 노드 메모
) {}
