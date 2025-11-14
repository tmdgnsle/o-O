package com.ssafy.mindmapservice.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 홈 화면에서 새 마인드맵 생성 요청 DTO
 * 워크스페이스 생성 + 첫 노드 생성 + INITIAL AI 분석 요청을 한 번에 처리
 */
@Schema(description = "초기 마인드맵 생성 요청 DTO")
public record InitialMindmapRequest(

        @Schema(description = "워크스페이스 이름", example = "고기 요리 아이디어", required = true)
        String workspaceName,

        @Schema(description = "워크스페이스 설명", example = "다양한 고기 요리 레시피 정리", nullable = true)
        String workspaceDescription,

        @Schema(description = "첫 노드 키워드", example = "고기 요리", nullable = true)
        String keyword,

        @Schema(description = "콘텐츠 URL (이미지/영상)", example = "https://youtu.be/qDG3auuSb1E", required = true)
        String contentUrl,

        @Schema(description = "콘텐츠 타입", example = "VIDEO", allowableValues = {"IMAGE", "VIDEO", "TEXT"}, required = true)
        String contentType,

        @Schema(description = "사용자 프롬프트", example = "고기랑 관련된 아이디어 없을까?", required = true)
        String prompt
) {
}
