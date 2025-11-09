package com.ssafy.mindmapservice.dto;

/**
 * AI가 반환하는 개별 노드 정보
 * tempId를 통해 새로 생성될 노드를 식별하고, parentId를 통해 계층 구조를 정의합니다.
 */
public record AiNodeDto(
    String tempId,      // AI가 생성한 임시 ID (예: "temp-1", "temp-2")
    String parentId,    // 부모 노드 ID (숫자 문자열 또는 tempId, 루트인 경우 null)
    String keyword,     // 노드의 주요 키워드
    String memo         // 해당 키워드의 요약 설명 또는 메모
) {}
