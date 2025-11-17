package com.ssafy.mindmapservice.service;

import com.ssafy.mindmapservice.client.GmsOpenAiClient;
import com.ssafy.mindmapservice.domain.MindmapNode;
import com.ssafy.mindmapservice.dto.request.AnalyzeNodesRequest;
import com.ssafy.mindmapservice.dto.request.ChatCompletionRequest;
import com.ssafy.mindmapservice.dto.request.ChatMessage;
import com.ssafy.mindmapservice.dto.request.CreatePlanRequest;
import com.ssafy.mindmapservice.dto.response.AnalyzeNodesResponse;
import com.ssafy.mindmapservice.dto.response.ChatCompletionResponse;
import com.ssafy.mindmapservice.dto.response.CreatePlanResponse;
import com.ssafy.mindmapservice.repository.NodeRepository;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NodeAiService {

    private final NodeRepository nodeRepository;
    private final GmsOpenAiClient gmsOpenAiClient;

    @Value("${gms.api-key}")
    private String gmsApiKey;

    private static final String MODEL = "gpt-5";

    // ===================== 분석 API =====================

    public AnalyzeNodesResponse analyzeNodes(Long workspaceId, AnalyzeNodesRequest request) {
        if (request.getNodeIds() == null || request.getNodeIds().isEmpty()) {
            throw new IllegalArgumentException("nodeIds는 최소 1개 이상이어야 합니다.");
        }

        List<MindmapNode> nodes = nodeRepository
                .findByWorkspaceIdAndNodeIdIn(workspaceId, request.getNodeIds());

        if (nodes.isEmpty()) {
            throw new IllegalArgumentException("해당 워크스페이스에서 조회된 노드가 없습니다.");
        }

        String prompt = buildAnalysisPrompt(nodes);

        ChatCompletionRequest gmsRequest = new ChatCompletionRequest(
                MODEL,
                List.of(
                        new ChatMessage("developer",
                                "한국어로만 답변해 주세요. " +
                                        "항상 구조화된 Markdown 형식으로 답변하고, 불필요한 서론은 생략하세요."),
                        new ChatMessage("system",
                                "You are an expert product planner who analyzes mindmap structures " +
                                        "and extracts insights for service planning."),
                        new ChatMessage("user", prompt)
                ),
                0.3,
                800
        );

        ChatCompletionResponse gmsResponse = callGms(gmsRequest, "분석");

        String analysis = extractContent(gmsResponse);

        return new AnalyzeNodesResponse(analysis);
    }

    // ===================== 기획안 API =====================

    public CreatePlanResponse createPlanFromAnalysis(Long workspaceId, CreatePlanRequest request) {
        if (request.getAnalysisText() == null || request.getAnalysisText().isBlank()) {
            throw new IllegalArgumentException("analysisText는 비어 있을 수 없습니다.");
        }

        String prompt = buildPlanPrompt(request.getAnalysisText(), request.getTitle());

        ChatCompletionRequest gmsRequest = new ChatCompletionRequest(
                MODEL,
                List.of(
                        new ChatMessage("developer",
                                "한국어 비즈니스 문체로 답변하고, 반드시 지정된 목차 구조를 지키세요. " +
                                        "목차 제목은 그대로 사용하고, 각 항목 아래에 구체적인 내용을 작성하세요."),
                        new ChatMessage("system",
                                "You are a senior product manager who writes real-world service planning documents " +
                                        "based on analysis summaries."),
                        new ChatMessage("user", prompt)
                ),
                0.3,
                800
        );

        ChatCompletionResponse gmsResponse = callGms(gmsRequest, "기획안 생성");

        String plan = extractContent(gmsResponse);

        return new CreatePlanResponse(plan);
    }

    // ===================== 공통 GMS 호출 & 응답 처리 =====================

    private ChatCompletionResponse callGms(ChatCompletionRequest request, String purpose) {
        try {
            ChatCompletionResponse response =
                    gmsOpenAiClient.createChatCompletion("Bearer " + gmsApiKey, request);

            if (response == null) {
                log.error("[GMS {}] 응답이 null입니다.", purpose);
                throw new IllegalStateException("GMS 응답이 null입니다.");
            }

            if (response.getChoices() == null || response.getChoices().isEmpty()) {
                log.error("[GMS {}] choices가 비어 있습니다. response={}", purpose, response);
                throw new IllegalStateException("GMS 응답에 choices가 없습니다.");
            }

            return response;
        } catch (FeignException e) {
            // GMS 쪽에서 4xx/5xx 등 떨어진 경우
            log.error("[GMS {}] FeignException 발생: status={}, message={}",
                    purpose, e.status(), e.getMessage(), e);
            throw new IllegalStateException("GMS 호출 중 오류가 발생했습니다. (status=" + e.status() + ")", e);
        } catch (Exception e) {
            log.error("[GMS {}] 예기치 못한 오류 발생: {}", purpose, e.getMessage(), e);
            throw new IllegalStateException("GMS 호출 중 알 수 없는 오류가 발생했습니다.", e);
        }
    }

    private String extractContent(ChatCompletionResponse response) {
        try {
            return response.getChoices()
                    .get(0)
                    .getMessage()
                    .getContent();
        } catch (Exception e) {
            log.error("GMS 응답 파싱 중 오류 발생: response={}", response, e);
            throw new IllegalStateException("GMS 응답 포맷이 예상과 다릅니다.", e);
        }
    }

    // ===================== 프롬프트 템플릿 =====================

    /**
     * 마인드맵 노드 분석용 프롬프트
     */
    private String buildAnalysisPrompt(List<MindmapNode> nodes) {
        StringBuilder sb = new StringBuilder();
        sb.append("""
            아래는 사용자가 만든 마인드맵 노드 목록입니다.
            각 노드는 nodeId, parentId, type, keyword, memo 정보를 가지고 있으며,
            parentId를 통해 계층 구조(상위/하위 관계)를 파악할 수 있습니다.

            이 마인드맵을 분석하여 다음 내용을 작성해 주세요.

            1. 전체 주제 요약 (3~5문장)
            2. 사용자가 해결하려는 핵심 문제 또는 니즈
            3. 주요 아이디어/기능 그룹 (상위 카테고리별로 정리)
            4. 사용자 관점에서 기대되는 가치/효과
            5. 기획 관점에서 보완하면 좋을 점 3가지

            - 답변은 Markdown 형식으로 작성해 주세요.
            - 불필요한 서론, 사족은 제거하고 바로 분석 결과만 제시하세요.

            ### 마인드맵 노드 데이터 (JSON 형식)
            [
            """);

        // 간단한 JSON-like 포맷 (실제로는 ObjectMapper 쓰는 걸 추천)
        for (int i = 0; i < nodes.size(); i++) {
            MindmapNode n = nodes.get(i);
            sb.append("  {")
                    .append("\"nodeId\": ").append(n.getNodeId()).append(", ")
                    .append("\"parentId\": ").append(n.getParentId() == null ? "null" : n.getParentId()).append(", ")
                    .append("\"type\": \"").append(nullToEmpty(n.getType())).append("\", ")
                    .append("\"keyword\": \"").append(escape(n.getKeyword())).append("\", ")
                    .append("\"memo\": \"").append(escape(n.getMemo())).append("\"")
                    .append("}");
            if (i < nodes.size() - 1) sb.append(",");
            sb.append("\n");
        }
        sb.append("]\n");

        return sb.toString();
    }

    /**
     * 분석 결과 기반 기획안 생성용 프롬프트
     */
    private String buildPlanPrompt(String analysis, String title) {
        String finalTitle = (title == null || title.isBlank())
                ? "마인드맵 기반 서비스 기획안"
                : title;

        return """
            아래는 마인드맵을 기반으로 정리된 분석 내용입니다.
            이 분석을 바탕으로 실제 현업에서 사용할 수 있는 수준의 서비스 기획서를 작성해 주세요.

            기획안은 다음 요구사항을 반드시 만족해야 합니다.

            - 한국어 비즈니스 문체 사용
            - Markdown 형식 사용
            - 아래 목차를 그대로 포함하고, 각 항목 아래에 구체적인 내용을 채울 것

            # %s

            ## 1. 서비스 개요
            - 서비스 한 줄 정의
            - 서비스 설명(3~5문장)

            ## 2. 기획 배경 및 문제 정의
            - 해결하려는 문제/니즈
            - 현재 사용자의 Pain Point

            ## 3. 타깃 사용자 및 페르소나
            - 주요 타깃 세그먼트
            - 대표 페르소나 1~2명 (나이, 직업, 상황, 니즈)

            ## 4. 핵심 가치 제안 (Value Proposition)
            - 이 서비스가 제공하는 핵심 가치 3~5개

            ## 5. 주요 기능 정의
            - 기능을 3~7개 그룹으로 나누고,
              각 기능에 대해 [기능 이름 / 상세 설명 / 기대 효과]를 정리

            ## 6. 주요 사용자 흐름 (UX Flow)
            - 주요 플로우: 가입/온보딩 → 핵심 기능 사용 → 재방문/리텐션
            - 각 단계에서 사용자의 행동과 화면을 간략히 서술

            ## 7. MVP 범위 정의
            - 1차 출시(MVP)에 반드시 포함해야 할 기능
            - 이후 단계에서 추가할 기능

            ## 8. 향후 로드맵
            - 1개월, 3개월, 6개월 관점의 고레벨 로드맵

            ## 9. 성공 지표 (KPI)
            - 3~5개의 주요 KPI와 그 의미

            아래 분석 내용을 충분히 참고하여, 실제 회의/문서에서 바로 사용할 수 있을 수준으로 작성해 주세요.

            --- 분석 내용 시작 ---
            %s
            --- 분석 내용 끝 ---
            """.formatted(finalTitle, analysis);
    }

    // ===== 간단 유틸 =====
    private String nullToEmpty(String s) {
        return s == null ? "" : s;
    }

    private String escape(String s) {
        if (s == null) return "";
        return s
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n");
    }
}
