package com.ssafy.mindmapservice.controller;

import com.ssafy.mindmapservice.domain.MindmapNode;
import com.ssafy.mindmapservice.dto.AiAnalysisRequest;
import com.ssafy.mindmapservice.dto.InitialMindmapRequest;
import com.ssafy.mindmapservice.dto.InitialMindmapResponse;
import com.ssafy.mindmapservice.dto.NodeColorUpdateRequest;
import com.ssafy.mindmapservice.dto.NodePositionUpdateRequest;
import com.ssafy.mindmapservice.dto.NodeSimpleDto;
import com.ssafy.mindmapservice.dto.WorkspaceCloneRequest;
import com.ssafy.mindmapservice.service.NodeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Mindmap Node API", description = "마인드맵 노드 관리 및 AI 분석 API")
@Slf4j
@RestController
@RequestMapping("/mindmap")
@RequiredArgsConstructor
public class NodeController {

    private final NodeService nodeService;

    @Operation(
            summary = "초기 마인드맵 생성 (홈 화면)",
            description = """
                    ## 홈 화면에서 새 마인드맵 생성

                    워크스페이스 생성 + 첫 노드 생성 + INITIAL AI 분석 요청을 한 번에 처리합니다.

                    ### 📌 처리 흐름
                    1. **워크스페이스 생성**: workspace-service를 호출하여 새 워크스페이스 생성
                    2. **첫 노드 생성**: 루트 노드(parentId = null) 생성
                    3. **AI 분석 요청**: INITIAL 타입으로 Kafka에 분석 요청 전송
                    4. **즉시 응답**: 생성된 워크스페이스 및 노드 정보 반환

                    ### ⚡ 비동기 처리
                    - AI 분석 결과는 Kafka Consumer를 통해 비동기로 처리됩니다
                    - 실시간 결과는 WebSocket을 통해 클라이언트에 전달됩니다
                    - 생성된 노드의 `analysisStatus`는 `PENDING` 상태로 반환됩니다

                    ### 📝 INITIAL 분석 결과
                    - AI 요약이 원본 노드의 `memo`에 저장됩니다
                    - 6개의 키워드 노드가 2단계 계층 구조로 생성됩니다
                    """
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "202",
                    description = "마인드맵 생성 완료. AI 분석이 진행 중입니다.",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = InitialMindmapResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 요청 (필수 필드 누락 등)",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "서버 오류 (워크스페이스 생성 실패, 노드 생성 실패 등)",
                    content = @Content
            )
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "초기 마인드맵 생성 요청 정보",
            required = true,
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = InitialMindmapRequest.class),
                    examples = {
                            @ExampleObject(
                                    name = "영상 콘텐츠 예시",
                                    summary = "유튜브 영상으로 마인드맵 생성",
                                    value = """
                                            {
                                              "workspaceName": "고기 요리 아이디어",
                                              "workspaceDescription": "다양한 고기 요리 레시피 정리",
                                              "keyword": "고기 요리",
                                              "contentUrl": "https://youtu.be/qDG3auuSb1E",
                                              "contentType": "VIDEO",
                                              "prompt": "고기랑 관련된 아이디어 없을까?"
                                            }
                                            """
                            ),
                            @ExampleObject(
                                    name = "이미지 콘텐츠 예시",
                                    summary = "이미지로 마인드맵 생성",
                                    value = """
                                            {
                                              "workspaceName": "여행 계획",
                                              "workspaceDescription": "여름 휴가 여행 계획",
                                              "keyword": null,
                                              "contentUrl": "https://example.com/image.jpg",
                                              "contentType": "IMAGE",
                                              "prompt": "이 사진을 보고 여행 아이디어를 제안해줘"
                                            }
                                            """
                            )
                    }
            )
    )
    @PostMapping("/create-initial")
    public ResponseEntity<InitialMindmapResponse> createInitialMindmap(
            @RequestBody InitialMindmapRequest request) {
        log.info("POST /mindmap/create-initial - workspaceName={}, contentType={}",
                request.workspaceName(), request.contentType());

        InitialMindmapResponse response = nodeService.createInitialMindmap(request);

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }

    @Operation(
            summary = "워크스페이스의 모든 노드 조회",
            description = "특정 워크스페이스에 속한 모든 마인드맵 노드를 조회합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "노드 목록 조회 성공"),
            @ApiResponse(responseCode = "404", description = "워크스페이스를 찾을 수 없음", content = @Content)
    })
    @GetMapping("/{workspaceId}/nodes")
    public ResponseEntity<List<MindmapNode>> getNodes(
            @Parameter(description = "워크스페이스 ID", required = true, example = "123")
            @PathVariable Long workspaceId) {
        log.info("GET /mindmap/{}/nodes", workspaceId);
        List<MindmapNode> nodes = nodeService.getNodesByWorkspace(workspaceId);
        return ResponseEntity.ok(nodes);
    }

    @Operation(
            summary = "워크스페이스 노드 간단 조회",
            description = "특정 워크스페이스에 속한 노드의 간단한 정보(nodeId, keyword)만 조회합니다. 캘린더 등에서 경량화된 응답이 필요할 때 사용됩니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "노드 간단 정보 조회 성공"),
            @ApiResponse(responseCode = "404", description = "워크스페이스를 찾을 수 없음", content = @Content)
    })
    @GetMapping("/{workspaceId}/nodes/simple")
    public ResponseEntity<List<NodeSimpleDto>> getSimpleNodes(
            @Parameter(description = "워크스페이스 ID", required = true, example = "123")
            @PathVariable Long workspaceId) {
        log.info("GET /mindmap/{}/nodes/simple", workspaceId);
        List<NodeSimpleDto> nodes = nodeService.getSimpleNodesByWorkspace(workspaceId);
        return ResponseEntity.ok(nodes);
    }

    @Operation(
            summary = "여러 워크스페이스 노드 일괄 조회",
            description = "여러 워크스페이스의 노드 간단 정보(nodeId, keyword)를 한 번에 조회합니다. workspaceId별로 그룹핑된 Map 형태로 반환됩니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "노드 일괄 조회 성공")
    })
    @PostMapping("/nodes/simple/batch")
    public ResponseEntity<Map<Long, List<NodeSimpleDto>>> getSimpleNodesBatch(
            @Parameter(description = "워크스페이스 ID 목록", required = true)
            @RequestBody List<Long> workspaceIds) {
        log.info("POST /mindmap/nodes/simple/batch - {} workspaces", workspaceIds.size());
        Map<Long, List<NodeSimpleDto>> result = nodeService.getSimpleNodesByWorkspaces(workspaceIds);
        return ResponseEntity.ok(result);
    }

    @Operation(
            summary = "특정 노드 조회",
            description = "워크스페이스 내의 특정 노드를 ID로 조회합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "노드 조회 성공"),
            @ApiResponse(responseCode = "404", description = "노드를 찾을 수 없음", content = @Content)
    })
    @GetMapping("/{workspaceId}/node/{nodeId}")
    public ResponseEntity<MindmapNode> getNode(
            @Parameter(description = "워크스페이스 ID", required = true, example = "123")
            @PathVariable Long workspaceId,
            @Parameter(description = "노드 ID", required = true, example = "1")
            @PathVariable Long nodeId) {
        log.info("GET /mindmap/{}/node/{}", workspaceId, nodeId);
        MindmapNode node = nodeService.getNode(workspaceId, nodeId);
        return ResponseEntity.ok(node);
    }

    @Operation(
            summary = "노드 생성",
            description = "워크스페이스에 새로운 마인드맵 노드를 생성합니다. nodeId는 자동으로 생성됩니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "노드 생성 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청", content = @Content),
            @ApiResponse(responseCode = "404", description = "워크스페이스를 찾을 수 없음", content = @Content)
    })
    @PostMapping("/{workspaceId}/node")
    public ResponseEntity<MindmapNode> createNode(
            @Parameter(description = "워크스페이스 ID", required = true, example = "123")
            @PathVariable Long workspaceId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "생성할 노드 정보 (nodeId는 자동 생성되므로 제외)",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    value = """
                                            {
                                              "parentId": 1,
                                              "type": "text",
                                              "keyword": "새 아이디어",
                                              "memo": "메모 내용",
                                              "x": 100.0,
                                              "y": 200.0,
                                              "color": "#3b82f6"
                                            }
                                            """
                            )
                    )
            )
            @RequestBody MindmapNode node) {
        log.info("POST /mindmap/{}/node", workspaceId);
        node.setWorkspaceId(workspaceId);
        MindmapNode created = nodeService.createNode(node);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(
            summary = "노드 수정",
            description = "기존 노드의 정보를 부분적으로 수정합니다. 제공된 필드만 업데이트됩니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "노드 수정 성공"),
            @ApiResponse(responseCode = "404", description = "노드를 찾을 수 없음", content = @Content)
    })
    @PatchMapping("/{workspaceId}/node/{nodeId}")
    public ResponseEntity<MindmapNode> updateNode(
            @Parameter(description = "워크스페이스 ID", required = true, example = "123")
            @PathVariable Long workspaceId,
            @Parameter(description = "노드 ID", required = true, example = "1")
            @PathVariable Long nodeId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "수정할 필드만 포함 (null이 아닌 필드만 업데이트됨)",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    value = """
                                            {
                                              "keyword": "수정된 키워드",
                                              "memo": "수정된 메모"
                                            }
                                            """
                            )
                    )
            )
            @RequestBody MindmapNode updates) {
        log.info("PATCH /mindmap/{}/node/{}", workspaceId, nodeId);
        MindmapNode updated = nodeService.updateNode(workspaceId, nodeId, updates);
        return ResponseEntity.ok(updated);
    }

    @Operation(
            summary = "노드 삭제",
            description = "특정 노드를 삭제합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "노드 삭제 성공"),
            @ApiResponse(responseCode = "404", description = "노드를 찾을 수 없음", content = @Content)
    })
    @DeleteMapping("/{workspaceId}/node/{nodeId}")
    public ResponseEntity<Void> deleteNode(
            @Parameter(description = "워크스페이스 ID", required = true, example = "123")
            @PathVariable Long workspaceId,
            @Parameter(description = "노드 ID", required = true, example = "1")
            @PathVariable Long nodeId) {
        log.info("DELETE /mindmap/{}/node/{}", workspaceId, nodeId);
        nodeService.deleteNode(workspaceId, nodeId);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "워크스페이스의 모든 노드 삭제",
            description = "특정 워크스페이스에 속한 모든 노드를 삭제합니다. **주의**: 복구 불가능합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "모든 노드 삭제 성공"),
            @ApiResponse(responseCode = "404", description = "워크스페이스를 찾을 수 없음", content = @Content)
    })
    @DeleteMapping("/{workspaceId}/nodes")
    public ResponseEntity<Void> deleteAllNodes(
            @Parameter(description = "워크스페이스 ID", required = true, example = "123")
            @PathVariable Long workspaceId) {
        log.info("DELETE /mindmap/{}/nodes", workspaceId);
        nodeService.deleteAllNodes(workspaceId);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "워크스페이스의 노드 개수 조회",
            description = "특정 워크스페이스에 속한 노드의 총 개수를 조회합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "노드 개수 조회 성공")
    })
    @GetMapping("/{workspaceId}/nodes/count")
    public ResponseEntity<Long> countNodes(
            @Parameter(description = "워크스페이스 ID", required = true, example = "123")
            @PathVariable Long workspaceId) {
        log.info("GET /mindmap/{}/nodes/count", workspaceId);
        long count = nodeService.countNodes(workspaceId);
        return ResponseEntity.ok(count);
    }

    @Operation(
            summary = "노드 위치 업데이트",
            description = "캔버스 상에서 노드의 위치(x, y 좌표)를 업데이트합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "위치 업데이트 성공"),
            @ApiResponse(responseCode = "404", description = "노드를 찾을 수 없음", content = @Content)
    })
    @PatchMapping("/{workspaceId}/node/{nodeId}/position")
    public ResponseEntity<MindmapNode> updateNodePosition(
            @Parameter(description = "워크스페이스 ID", required = true, example = "123")
            @PathVariable Long workspaceId,
            @Parameter(description = "노드 ID", required = true, example = "1")
            @PathVariable Long nodeId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "새 위치 좌표",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    value = """
                                            {
                                              "x": 150.5,
                                              "y": 250.3
                                            }
                                            """
                            )
                    )
            )
            @RequestBody NodePositionUpdateRequest request) {
        log.info("PATCH /mindmap/{}/node/{}/position", workspaceId, nodeId);
        MindmapNode updated = nodeService.updateNodePosition(workspaceId, nodeId, request.x(), request.y());
        return ResponseEntity.ok(updated);
    }

    @Operation(
            summary = "노드 색상 업데이트",
            description = "노드의 배경 색상을 업데이트합니다. (Hex 코드 형식)"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "색상 업데이트 성공"),
            @ApiResponse(responseCode = "404", description = "노드를 찾을 수 없음", content = @Content)
    })
    @PatchMapping("/{workspaceId}/node/{nodeId}/color")
    public ResponseEntity<MindmapNode> updateNodeColor(
            @Parameter(description = "워크스페이스 ID", required = true, example = "123")
            @PathVariable Long workspaceId,
            @Parameter(description = "노드 ID", required = true, example = "1")
            @PathVariable Long nodeId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "새 색상 (Hex 코드)",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    value = """
                                            {
                                              "color": "#3b82f6"
                                            }
                                            """
                            )
                    )
            )
            @RequestBody NodeColorUpdateRequest request) {
        log.info("PATCH /mindmap/{}/node/{}/color", workspaceId, nodeId);
        MindmapNode updated = nodeService.updateNodeColor(workspaceId, nodeId, request.color());
        return ResponseEntity.ok(updated);
    }

    @Operation(
            summary = "워크스페이스 복제",
            description = "기존 워크스페이스의 모든 노드를 새 워크스페이스로 복제합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "워크스페이스 복제 성공"),
            @ApiResponse(responseCode = "404", description = "원본 워크스페이스를 찾을 수 없음", content = @Content),
            @ApiResponse(responseCode = "500", description = "복제 중 오류 발생", content = @Content)
    })
    @PostMapping("/{workspaceId}/clone")
    public ResponseEntity<List<MindmapNode>> cloneWorkspace(
            @Parameter(description = "원본 워크스페이스 ID", required = true, example = "123")
            @PathVariable Long workspaceId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "새 워크스페이스 정보",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(
                                    value = """
                                            {
                                              "workspaceName": "복제된 워크스페이스",
                                              "workspaceDescription": "원본의 복사본"
                                            }
                                            """
                            )
                    )
            )
            @RequestBody WorkspaceCloneRequest request) {
        log.info("POST /mindmap/{}/clone with name={}", workspaceId, request.workspaceName());
        List<MindmapNode> clonedNodes = nodeService.cloneWorkspace(
                workspaceId,
                request.workspaceName(),
                request.workspaceDescription()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(clonedNodes);
    }

    @Operation(
            summary = "AI 분석 요청",
            description = """
                    ## AI 기반 마인드맵 노드 분석 요청

                    콘텐츠(이미지/영상/텍스트)를 분석하여 마인드맵 노드를 자동 생성합니다.
                    요청은 Kafka를 통해 비동기로 처리되며, 결과는 WebSocket으로 실시간 전달됩니다.

                    ### 📌 분석 타입

                    #### 1️⃣ INITIAL (최초 분석)
                    - **사용 시점**: 홈 화면에서 새 워크스페이스의 첫 노드 생성 시
                    - **입력**: contentUrl, contentType, prompt, analysisType
                    - **출력**: AI 요약(memo 업데이트) + 6개의 키워드 노드 (2단계 계층 구조)
                    - **nodes 필드**: null (생략)

                    #### 2️⃣ CONTEXTUAL (맥락 기반 확장)
                    - **사용 시점**: 기존 노드를 확장할 때
                    - **입력**: nodes (조상 경로), analysisType
                    - **출력**: 3개의 자식 노드 (keyword + memo)
                    - **contentUrl, prompt**: null (생략)

                    ### ⚠️ 주의사항
                    - INITIAL 요청 시 `nodes` 필드는 반드시 null이어야 합니다
                    - CONTEXTUAL 요청 시 `nodes` 필드에 nodeId부터 루트까지의 조상 경로를 포함해야 합니다
                    - 응답은 202 Accepted로 즉시 반환되며, 실제 결과는 Kafka Consumer를 통해 비동기 처리됩니다
                    """
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "202",
                    description = "분석 요청이 정상적으로 접수되었습니다. 결과는 Kafka를 통해 비동기로 처리됩니다.",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 요청 (필수 필드 누락, 분석 타입 불일치 등)",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "노드를 찾을 수 없음",
                    content = @Content
            )
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "AI 분석 요청 정보",
            required = true,
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = AiAnalysisRequest.class),
                    examples = {
                            @ExampleObject(
                                    name = "INITIAL 요청 예시",
                                    summary = "최초 분석 요청 (영상 콘텐츠)",
                                    value = """
                                            {
                                              "workspaceId": 123,
                                              "nodeId": 1,
                                              "contentUrl": "https://youtu.be/qDG3auuSb1E",
                                              "contentType": "VIDEO",
                                              "prompt": "고기랑 관련된 아이디어 없을까?",
                                              "analysisType": "INITIAL",
                                              "nodes": null
                                            }
                                            """
                            ),
                            @ExampleObject(
                                    name = "CONTEXTUAL 요청 예시",
                                    summary = "맥락 기반 확장 요청",
                                    value = """
                                            {
                                              "workspaceId": 123,
                                              "nodeId": 15,
                                              "contentUrl": null,
                                              "contentType": "TEXT",
                                              "prompt": null,
                                              "analysisType": "CONTEXTUAL",
                                              "nodes": [
                                                {
                                                  "nodeId": 2,
                                                  "parentId": 1,
                                                  "keyword": "굽기 정도별 레시피",
                                                  "memo": "레어~웰던 단계별 조리 시간 비교"
                                                },
                                                {
                                                  "nodeId": 3,
                                                  "parentId": 2,
                                                  "keyword": "부위별 특징",
                                                  "memo": "안심, 등심 등 질감 및 맛 차이 설명"
                                                },
                                                {
                                                  "nodeId": 15,
                                                  "parentId": 3,
                                                  "keyword": "고기",
                                                  "memo": "고기 종류"
                                                }
                                              ]
                                            }
                                            """
                            )
                    }
            )
    )
    @PostMapping("/{workspaceId}/node/{nodeId}/analyze")
    public ResponseEntity<Void> requestAiAnalysis(
            @Parameter(description = "워크스페이스 ID", required = true, example = "123")
            @PathVariable Long workspaceId,

            @Parameter(description = "노드 ID (INITIAL: 첫 노드, CONTEXTUAL: 확장할 노드)", required = true, example = "1")
            @PathVariable Long nodeId,

            @RequestBody AiAnalysisRequest request) {
        log.info("POST /mindmap/{}/node/{}/analyze - type={}, contentType={}",
                workspaceId, nodeId, request.analysisType(), request.contentType());

        nodeService.requestAiAnalysis(
                workspaceId,
                nodeId,
                request.contentUrl(),
                request.contentType(),
                request.prompt(),
                request.analysisType()
        );

        return ResponseEntity.accepted().build();
    }
}
