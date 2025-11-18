package com.ssafy.mindmapservice.controller;

import com.ssafy.mindmapservice.dto.request.AnalyzeNodesRequest;
import com.ssafy.mindmapservice.dto.request.CreatePlanRequest;
import com.ssafy.mindmapservice.dto.response.AnalyzeNodesResponse;
import com.ssafy.mindmapservice.dto.response.CreatePlanResponse;
import com.ssafy.mindmapservice.service.NodeAiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/mindmap/{workspaceId}/ai")
@Tag(name = "Node AI", description = "마인드맵 노드 AI 분석/기획안 관련 API")
public class NodeAiController {

    private final NodeAiService nodeAiService;

    @Operation(
            summary = "마인드맵 노드 분석",
            description = """
                    선택한 노드 목록(nodeId 기준)을 기반으로 마인드맵 전체 흐름과 핵심 포인트를 분석합니다.
                    클라이언트는 nodeId 리스트만 보내면 되며, 서버가 MongoDB에서 노드를 조회한 뒤
                    GMS(gpt-5)를 호출해 분석 결과를 생성합니다.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "분석 성공",
                    content = @Content(schema = @Schema(implementation = AnalyzeNodesResponse.class))),
            @ApiResponse(responseCode = "400", description = "요청 값 오류"),
            @ApiResponse(responseCode = "500", description = "GMS 호출 실패 또는 서버 오류")
    })
    @PostMapping("/analyze-nodes")
    public ResponseEntity<AnalyzeNodesResponse> analyzeNodes(
            @Parameter(description = "워크스페이스 ID", example = "1")
            @PathVariable Long workspaceId,
            @RequestBody AnalyzeNodesRequest request
    ) {
        AnalyzeNodesResponse response = nodeAiService.analyzeNodes(workspaceId, request);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "분석 결과 기반 기획안 생성",
            description = """
                    앞서 받은 분석 결과 텍스트를 기반으로 실제 서비스 기획안을 생성합니다.
                    기획안은 한국어 비즈니스 문체로, 정해진 목차(서비스 개요, 문제 정의, 타깃, 기능 정의 등)를 포함한
                    문서 형태로 반환됩니다.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "기획안 생성 성공",
                    content = @Content(schema = @Schema(implementation = CreatePlanResponse.class))),
            @ApiResponse(responseCode = "400", description = "요청 값 오류"),
            @ApiResponse(responseCode = "500", description = "GMS 호출 실패 또는 서버 오류")
    })
    @PostMapping("/create-plan")
    public ResponseEntity<CreatePlanResponse> createPlan(
            @Parameter(description = "워크스페이스 ID", example = "1")
            @PathVariable Long workspaceId,
            @RequestBody CreatePlanRequest request
    ) {
        CreatePlanResponse response = nodeAiService.createPlanFromAnalysis(workspaceId, request);
        return ResponseEntity.ok(response);
    }


    @Operation(
            summary = "마인드맵 전체 구조 정리하기",
            description = """
                    현재 워크스페이스의 모든 노드를 GPT 기반으로 재구성하여
                    더 깔끔한 트리 구조로 정렬합니다.

                    수행 과정:
                    1) 서버가 해당 workspace 의 모든 노드를 MongoDB에서 조회
                    2) GPT(gpt-5-mini)를 사용해 의미 기반 트리 구조 재배치
                    3) 노드 병합, parent 재구성, root(nodeId=1) 보존
                    4) DB 전체 덮어쓰기
                    5) Kafka(mindmap.restructure.update) 이벤트 발행 → 실시간 클라이언트 반영

                    이 API는 약 4~7초 정도 소요될 수 있습니다.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "정리 작업 시작됨",
                    content = @Content(schema = @Schema(example = """
                            {
                              "message": "정리 작업이 시작되었습니다."
                            }
                            """))),
            @ApiResponse(responseCode = "400", description = "잘못된 workspaceId"),
            @ApiResponse(responseCode = "500", description = "정리 작업 중 오류 발생")
    })
    @PostMapping("/restructure")
    public ResponseEntity<Map<String, String>> restructureMindmap(
            @Parameter(description = "워크스페이스 ID", example = "1")
            @PathVariable Long workspaceId
    ) {
        nodeAiService.restructureWorkspace(workspaceId);
        return ResponseEntity.ok(Map.of("message", "정리 작업이 시작되었습니다."));
    }
}
