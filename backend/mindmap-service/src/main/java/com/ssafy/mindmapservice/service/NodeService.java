package com.ssafy.mindmapservice.service;

import com.ssafy.mindmapservice.client.WorkspaceServiceClient;
import com.ssafy.mindmapservice.domain.MindmapNode;
import com.ssafy.mindmapservice.dto.AiAnalysisRequest;
import com.ssafy.mindmapservice.dto.AiNodeDto;
import com.ssafy.mindmapservice.dto.InitialMindmapRequest;
import com.ssafy.mindmapservice.dto.InitialMindmapResponse;
import com.ssafy.mindmapservice.dto.NodeContextDto;
import com.ssafy.mindmapservice.dto.NodeSimpleDto;
import com.ssafy.mindmapservice.kafka.AiAnalysisProducer;
import com.ssafy.mindmapservice.repository.NodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NodeService {

    private final NodeRepository nodeRepository;
    private final WorkspaceServiceClient workspaceServiceClient;
    private final AiAnalysisProducer aiAnalysisProducer;
    private final SequenceGeneratorService sequenceGeneratorService;
    private final TrendEventPublisher trendEventPublisher;

    public List<MindmapNode> getNodesByWorkspace(Long workspaceId) {
        log.debug("Getting all nodes for workspace: {}", workspaceId);
        return nodeRepository.findByWorkspaceId(workspaceId);
    }

    /**
     * 워크스페이스의 노드 간단 정보 조회 (nodeId, keyword만 포함)
     * 캘린더 등에서 경량화된 응답이 필요할 때 사용
     */
    public List<NodeSimpleDto> getSimpleNodesByWorkspace(Long workspaceId) {
        log.debug("Getting simple nodes for workspace: {}", workspaceId);
        List<MindmapNode> nodes = nodeRepository.findByWorkspaceId(workspaceId);
        return nodes.stream()
                .map(NodeSimpleDto::from)
                .toList();
    }

    /**
     * 여러 워크스페이스의 노드 간단 정보를 일괄 조회 (workspaceId별로 그룹핑)
     * N+1 문제를 방지하기 위해 단일 쿼리로 조회
     */
    public Map<Long, List<NodeSimpleDto>> getSimpleNodesByWorkspaces(List<Long> workspaceIds) {
        log.debug("Getting simple nodes for {} workspaces", workspaceIds.size());

        if (workspaceIds == null || workspaceIds.isEmpty()) {
            return Map.of();
        }

        List<MindmapNode> nodes = nodeRepository.findByWorkspaceIdIn(workspaceIds);

        // workspaceId별로 그룹핑하고 DTO로 변환
        return nodes.stream()
                .collect(Collectors.groupingBy(
                        MindmapNode::getWorkspaceId,
                        Collectors.mapping(NodeSimpleDto::from, Collectors.toList())
                ));
    }

    public MindmapNode getNode(Long workspaceId, Long nodeId) {
        log.debug("Getting node: workspaceId={}, nodeId={}", workspaceId, nodeId);
        return nodeRepository.findByWorkspaceIdAndNodeId(workspaceId, nodeId)
                .orElseThrow(() -> new IllegalArgumentException("Node not found: " + nodeId));
    }

    public MindmapNode createNode(MindmapNode node) {
        log.debug("Creating node: workspaceId={}", node.getWorkspaceId());

        // nodeId 자동 생성 (워크스페이스별로 1부터 증가)
        Long nextNodeId = sequenceGeneratorService.generateNextNodeId(node.getWorkspaceId());
        node.setNodeId(nextNodeId);

        node.setCreatedAt(LocalDateTime.now());
        node.setUpdatedAt(LocalDateTime.now());

        if (node.getAnalysisStatus() == null) {
            node.setAnalysisStatus(MindmapNode.AnalysisStatus.NONE);
        }

        MindmapNode saved = nodeRepository.save(node);

        log.info("Created node with auto-generated nodeId: workspaceId={}, nodeId={}",
                saved.getWorkspaceId(), saved.getNodeId());

        // 🔥 트렌드 집계 이벤트 발행 (AI / 수동 상관없이 전부)
        try {
            Long workspaceId = saved.getWorkspaceId();
            String childKeyword = saved.getKeyword();

            // 부모 키워드 계산
            String parentKeyword;

            if (saved.getParentId() == null) {
                // 루트 노드는 __root__ 기준으로 집계
                parentKeyword = "__root__";
            } else {
                MindmapNode parent = nodeRepository
                        .findByWorkspaceIdAndNodeId(workspaceId, saved.getParentId())
                        .orElse(null);

                if (parent != null) {
                    parentKeyword = parent.getKeyword();
                } else {
                    // 부모를 못 찾으면 일단 __root__로 처리
                    parentKeyword = "__root__";
                }
            }

            trendEventPublisher.publishRelationAdd(workspaceId, parentKeyword, childKeyword);
            log.debug("Published trend relation add event: ws={}, parent={}, child={}",
                    workspaceId, parentKeyword, childKeyword);

        } catch (Exception e) {
            // 트렌드 집계 실패해도 노드 저장은 깨지지 않게
            log.error("Failed to publish trend relation add event for nodeId={}", saved.getNodeId(), e);
        }

        return saved;
    }

    public MindmapNode updateNode(Long workspaceId, Long nodeId, MindmapNode updates) {
        log.debug("Updating node: workspaceId={}, nodeId={}", workspaceId, nodeId);

        MindmapNode existingNode = nodeRepository.findByWorkspaceIdAndNodeId(workspaceId, nodeId)
                .orElseThrow(() -> new IllegalArgumentException("Node not found: " + nodeId));

        if (updates.getKeyword() != null) {
            existingNode.setKeyword(updates.getKeyword());
        }
        if (updates.getMemo() != null) {
            existingNode.setMemo(updates.getMemo());
        }
        if (updates.getX() != null) {
            existingNode.setX(updates.getX());
        }
        if (updates.getY() != null) {
            existingNode.setY(updates.getY());
        }
        if (updates.getColor() != null) {
            existingNode.setColor(updates.getColor());
        }
        if (updates.getParentId() != null) {
            existingNode.setParentId(updates.getParentId());
        }
        if (updates.getAnalysisStatus() != null) {
            existingNode.setAnalysisStatus(updates.getAnalysisStatus());
        }

        existingNode.setUpdatedAt(LocalDateTime.now());

        return nodeRepository.save(existingNode);
    }

    @Transactional
    public void deleteNode(Long workspaceId, Long nodeId) {
        log.debug("Deleting node: workspaceId={}, nodeId={}", workspaceId, nodeId);
        nodeRepository.deleteByWorkspaceIdAndNodeId(workspaceId, nodeId);
    }

    @Transactional
    public void deleteAllNodes(Long workspaceId) {
        log.debug("Deleting all nodes for workspace: {}", workspaceId);
        nodeRepository.deleteByWorkspaceId(workspaceId);
    }

    public long countNodes(Long workspaceId) {
        return nodeRepository.countByWorkspaceId(workspaceId);
    }

    public MindmapNode updateNodePosition(Long workspaceId, Long nodeId, Double x, Double y) {
        log.debug("Updating node position: workspaceId={}, nodeId={}, x={}, y={}", workspaceId, nodeId, x, y);

        MindmapNode node = nodeRepository.findByWorkspaceIdAndNodeId(workspaceId, nodeId)
                .orElseThrow(() -> new IllegalArgumentException("Node not found: " + nodeId));

        node.setX(x);
        node.setY(y);
        node.setUpdatedAt(LocalDateTime.now());

        return nodeRepository.save(node);
    }

    public MindmapNode updateNodeColor(Long workspaceId, Long nodeId, String color) {
        log.debug("Updating node color: workspaceId={}, nodeId={}, color={}", workspaceId, nodeId, color);

        MindmapNode node = nodeRepository.findByWorkspaceIdAndNodeId(workspaceId, nodeId)
                .orElseThrow(() -> new IllegalArgumentException("Node not found: " + nodeId));

        node.setColor(color);
        node.setUpdatedAt(LocalDateTime.now());

        return nodeRepository.save(node);
    }

    @Transactional
    public List<MindmapNode> cloneWorkspace(Long sourceWorkspaceId, String newWorkspaceName, String newWorkspaceDescription) {
        log.info("Cloning workspace: source={}, newName={}", sourceWorkspaceId, newWorkspaceName);

        List<MindmapNode> sourceNodes = nodeRepository.findByWorkspaceId(sourceWorkspaceId);

        if (sourceNodes.isEmpty()) {
            throw new IllegalArgumentException("Source workspace is empty: " + sourceWorkspaceId);
        }

        Long newWorkspaceId = workspaceServiceClient.createWorkspace(newWorkspaceName, newWorkspaceDescription);
        log.info("Created new workspace with ID: {}", newWorkspaceId);

        List<MindmapNode> clonedNodes = sourceNodes.stream()
                .map(node -> MindmapNode.builder()
                        .nodeId(node.getNodeId())
                        .workspaceId(newWorkspaceId)
                        .parentId(node.getParentId())
                        .type(node.getType())
                        .keyword(node.getKeyword())
                        .memo(node.getMemo())
                        .analysisStatus(node.getAnalysisStatus())
                        .x(node.getX())
                        .y(node.getY())
                        .color(node.getColor())
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build())
                .toList();

        List<MindmapNode> savedNodes = nodeRepository.saveAll(clonedNodes);
        log.info("Cloned {} nodes to workspace {}", savedNodes.size(), newWorkspaceId);

        return savedNodes;
    }

    /**
     * 특정 노드의 조상 경로를 추적하여 컨텍스트 정보를 수집합니다.
     * CONTEXTUAL 분석 시 부모 노드들의 keyword와 memo를 AI에게 전달하기 위해 사용합니다.
     *
     * @param workspaceId 워크스페이스 ID
     * @param nodeId 시작 노드 ID
     * @return 조상 노드들의 컨텍스트 정보 (루트부터 현재 노드까지)
     */
    /**
     * 노드의 조상 경로를 수집합니다 (CONTEXTUAL 분석용)
     * nodeId부터 루트까지의 모든 노드 정보를 수집하여 반환합니다.
     */
    public List<NodeContextDto> getAncestorContext(Long workspaceId, Long nodeId) {
        log.debug("Collecting ancestor context: workspaceId={}, startNodeId={}", workspaceId, nodeId);

        List<NodeContextDto> context = new ArrayList<>();
        Long currentNodeId = nodeId;
        int depth = 0;
        final int MAX_DEPTH = 100; // 순환 참조 방지

        while (currentNodeId != null && depth < MAX_DEPTH) {
            final Long finalNodeId = currentNodeId; // final 변수로 선언
            MindmapNode node = nodeRepository.findByWorkspaceIdAndNodeId(workspaceId, finalNodeId)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Node not found: workspaceId=" + workspaceId + ", nodeId=" + finalNodeId));

            context.add(new NodeContextDto(
                    node.getNodeId(),
                    node.getParentId(),
                    node.getKeyword(),
                    node.getMemo()
            ));

            currentNodeId = node.getParentId();
            depth++;
        }

        // 루트부터 현재 노드까지 순서로 정렬
        Collections.reverse(context);

        log.debug("Collected {} ancestor nodes for context", context.size());
        return context;
    }

    /**
     * AI 분석 결과로부터 노드들을 생성합니다.
     * tempId를 실제 nodeId로 매핑하며, 계층 구조를 유지합니다.
     *
     * @param workspaceId 워크스페이스 ID
     * @param aiNodes AI가 생성한 노드 정보 리스트
     * @param parentNodeId 부모 노드 ID (CONTEXTUAL일 때 사용, INITIAL일 때 null)
     * @param analysisType "INITIAL" or "CONTEXTUAL"
     * @return 생성된 노드 리스트
     */
    @Transactional
    public List<MindmapNode> createNodesFromAiResult(
            Long workspaceId,
            List<AiNodeDto> aiNodes,
            Long parentNodeId,
            String analysisType) {

        log.info("Creating nodes from AI result: workspaceId={}, type={}, nodeCount={}",
                workspaceId, analysisType, aiNodes.size());

        // tempId → realId 매핑 맵
        Map<String, Long> tempIdToRealIdMap = new HashMap<>();
        List<MindmapNode> createdNodes = new ArrayList<>();

        if ("INITIAL".equals(analysisType)) {
            // INITIAL: 계층 구조를 유지하며 순차 생성
            // 1. 먼저 parentId가 null인 루트 레벨 노드들 생성
            for (AiNodeDto aiNode : aiNodes) {
                if (aiNode.parentId() == null) {
                    Long realParentId = parentNodeId; // INITIAL의 경우 최초 요청 노드가 부모
                    MindmapNode node = createNodeFromAiDto(workspaceId, aiNode, realParentId);
                    tempIdToRealIdMap.put(aiNode.tempId(), node.getNodeId());
                    createdNodes.add(node);
                    log.debug("Created root-level node: tempId={}, realId={}", aiNode.tempId(), node.getNodeId());
                }
            }

            // 2. 부모가 tempId인 노드들 생성 (여러 레벨이 있을 수 있음)
            boolean hasUnprocessed = true;
            int maxIterations = 10; // 무한 루프 방지
            int iteration = 0;

            while (hasUnprocessed && iteration < maxIterations) {
                hasUnprocessed = false;
                iteration++;

                for (AiNodeDto aiNode : aiNodes) {
                    // 이미 처리된 노드는 스킵
                    if (tempIdToRealIdMap.containsKey(aiNode.tempId())) {
                        continue;
                    }

                    if (aiNode.parentId() != null) {
                        // parentId가 숫자 문자열인 경우
                        Long realParentId = null;

                        try {
                            // 숫자로 파싱 시도 (기존 노드 ID)
                            realParentId = Long.parseLong(aiNode.parentId());
                        } catch (NumberFormatException e) {
                            // tempId인 경우 매핑에서 찾기
                            realParentId = tempIdToRealIdMap.get(aiNode.parentId());
                        }

                        if (realParentId != null) {
                            MindmapNode node = createNodeFromAiDto(workspaceId, aiNode, realParentId);
                            tempIdToRealIdMap.put(aiNode.tempId(), node.getNodeId());
                            createdNodes.add(node);
                            log.debug("Created child node: tempId={}, realId={}, parentId={}",
                                    aiNode.tempId(), node.getNodeId(), realParentId);
                        } else {
                            // 부모가 아직 생성되지 않음
                            hasUnprocessed = true;
                            log.debug("Skipping node (parent not ready): tempId={}, parentId={}",
                                    aiNode.tempId(), aiNode.parentId());
                        }
                    }
                }
            }

            if (hasUnprocessed) {
                log.warn("Some nodes could not be created due to unresolved parent references");
            }

        } else if ("CONTEXTUAL".equals(analysisType)) {
            // CONTEXTUAL: 모든 노드가 parentNodeId를 부모로 가짐
            for (AiNodeDto aiNode : aiNodes) {
                MindmapNode node = createNodeFromAiDto(workspaceId, aiNode, parentNodeId);
                createdNodes.add(node);
                log.debug("Created contextual node: keyword={}, realId={}, parentId={}",
                        aiNode.keyword(), node.getNodeId(), parentNodeId);
            }
        }

        log.info("Created {} nodes from AI result successfully", createdNodes.size());
        return createdNodes;
    }

    /**
     * AiNodeDto로부터 실제 MindmapNode를 생성합니다.
     *
     * @param workspaceId 워크스페이스 ID
     * @param aiNode AI 노드 DTO
     * @param parentId 부모 노드 ID
     * @return 생성된 MindmapNode
     */
    private MindmapNode createNodeFromAiDto(Long workspaceId, AiNodeDto aiNode, Long parentId) {
        MindmapNode node = MindmapNode.builder()
                .workspaceId(workspaceId)
                .parentId(parentId)
                .keyword(aiNode.keyword())
                .memo(aiNode.memo())
                .type("ai-generated")
                .analysisStatus(MindmapNode.AnalysisStatus.NONE)
                .build();

        return createNode(node);  // 기존 createNode 재사용 (nodeId 자동 생성)
    }

    /**
     * AI 분석을 요청합니다.
     * 1. 노드의 분석 상태를 PENDING으로 변경
     * 2. Kafka를 통해 AI 서버로 분석 요청 전송
     *
     * @param analysisType "INITIAL" or "CONTEXTUAL"
     */
    public void requestAiAnalysis(Long workspaceId, Long nodeId, String contentUrl,
                                  String contentType, String prompt,
                                  String analysisType) {
        log.info("Requesting AI analysis: workspaceId={}, nodeId={}, type={}, contentType={}",
                workspaceId, nodeId, analysisType, contentType);

        // 1. 노드 존재 확인
        MindmapNode node = nodeRepository.findByWorkspaceIdAndNodeId(workspaceId, nodeId)
                .orElseThrow(() -> new IllegalArgumentException("Node not found: " + nodeId));

        // 2. 노드 컨텍스트 수집 (CONTEXTUAL인 경우)
        List<NodeContextDto> nodes = null;
        if ("CONTEXTUAL".equals(analysisType)) {
            nodes = getAncestorContext(workspaceId, nodeId);
            log.debug("Collected node context with {} nodes", nodes.size());
        }

        // 3. 분석 상태를 PENDING으로 변경
        node.setAnalysisStatus(MindmapNode.AnalysisStatus.PENDING);
        node.setUpdatedAt(LocalDateTime.now());
        nodeRepository.save(node);

        // 4. Kafka를 통해 AI 서버로 분석 요청 전송
        AiAnalysisRequest request = new AiAnalysisRequest(
                workspaceId,
                nodeId,
                contentUrl,
                contentType,
                prompt,
                analysisType,
                nodes
        );

        aiAnalysisProducer.sendAnalysisRequest(request);

        log.info("AI analysis request sent successfully: nodeId={}, type={}", nodeId, analysisType);
    }

    /**
     * 홈 화면에서 새 마인드맵을 생성합니다.
     * 1. 워크스페이스 생성 (workspace-service 호출)
     * 2. 첫 번째 노드 생성
     * 3. INITIAL AI 분석 요청 (Kafka)
     * 4. 생성 정보 반환
     *
     * @param request 초기 마인드맵 생성 요청
     * @return 생성된 워크스페이스 및 노드 정보
     */
    @Transactional
    public InitialMindmapResponse createInitialMindmap(InitialMindmapRequest request) {
        log.info("Creating initial mindmap: workspaceName={}, contentType={}",
                request.workspaceName(), request.contentType());

        // 1. 워크스페이스 생성 (workspace-service 호출)
        Long workspaceId = workspaceServiceClient.createWorkspace(
                request.workspaceName(),
                request.workspaceDescription()
        );
        log.info("Workspace created: workspaceId={}", workspaceId);

        // 2. 첫 번째 노드 생성
        String nodeKeyword = request.keyword() != null && !request.keyword().isBlank()
                ? request.keyword()
                : request.workspaceName(); // keyword가 없으면 워크스페이스 이름 사용

        MindmapNode firstNode = MindmapNode.builder()
                .workspaceId(workspaceId)
                .parentId(null) // 루트 노드
                .type("root")
                .keyword(nodeKeyword)
                .memo("")
                .analysisStatus(MindmapNode.AnalysisStatus.PENDING)
                .build();

        MindmapNode createdNode = createNode(firstNode);
        log.info("First node created: workspaceId={}, nodeId={}", workspaceId, createdNode.getNodeId());

        // 3. INITIAL AI 분석 요청 (Kafka)
        AiAnalysisRequest analysisRequest = new AiAnalysisRequest(
                workspaceId,
                createdNode.getNodeId(),
                request.contentUrl(),
                request.contentType(),
                request.prompt(),
                "INITIAL",
                null // INITIAL 요청에서는 nodes = null
        );

        aiAnalysisProducer.sendAnalysisRequest(analysisRequest);
        log.info("INITIAL AI analysis request sent: workspaceId={}, nodeId={}",
                workspaceId, createdNode.getNodeId());

        // 4. 응답 생성
        return new InitialMindmapResponse(
                workspaceId,
                createdNode.getNodeId(),
                createdNode.getKeyword(),
                createdNode.getMemo(),
                createdNode.getAnalysisStatus().name(),
                "마인드맵이 생성되었습니다. AI 분석이 진행 중입니다."
        );
    }
}
