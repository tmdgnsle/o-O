package com.ssafy.mindmapservice.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.mindmapservice.client.WorkspaceServiceClientAdapter;
import com.ssafy.mindmapservice.domain.MindmapNode;
import com.ssafy.mindmapservice.dto.kafka.AiAnalysisResult;
import com.ssafy.mindmapservice.repository.NodeRepository;
import com.ssafy.mindmapservice.service.NodeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class AiAnalysisConsumer {

    private final NodeRepository nodeRepository;
    private final NodeUpdateProducer nodeUpdateProducer;
    private final NodeService nodeService;
    private final ObjectMapper objectMapper;
    private final WorkspaceServiceClientAdapter workspaceServiceClient;

    /**
     * AI 서버로부터 분석 결과를 받아서 처리합니다.
     * INITIAL: aiSummary를 원본 노드의 memo에 업데이트하고, 계층 구조 노드 생성
     * CONTEXTUAL: 부모 노드 아래에 3개의 자식 노드 생성
     *
     * 1. AI가 생성한 노드들을 MongoDB에 저장
     * 2. 원본 노드의 분석 상태를 DONE으로 변경
     * 3. mindmap.node.update 토픽으로 변경사항 발행 (y.js 서버 → 웹소켓 클라이언트)
     */
    @KafkaListener(topics = "${kafka.topics.ai-analysis-result}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeAnalysisResult(String message) {
        try {
            log.debug("Received AI analysis result: {}", message);

            AiAnalysisResult result = objectMapper.readValue(message, AiAnalysisResult.class);

            // 분석 타입 판별: aiSummary가 있으면 INITIAL, nodeId가 있으면 CONTEXTUAL
            boolean isInitial = result.aiSummary() != null;
            String analysisType = isInitial ? "INITIAL" : "CONTEXTUAL";

            // 원본 노드 ID 결정
            Long originalNodeId;
            if (isInitial) {
                // INITIAL: nodes[0]의 parentId가 원본 노드 ID
                if (result.nodes() == null || result.nodes().isEmpty()) {
                    log.error("INITIAL analysis result has no nodes: workspaceId={}", result.workspaceId());
                    return;
                }
                try {
                    originalNodeId = Long.parseLong(result.nodes().get(0).parentId());
                } catch (NumberFormatException e) {
                    log.error("Failed to parse parentId as nodeId in INITIAL result: {}", result.nodes().get(0).parentId());
                    return;
                }
            } else {
                // CONTEXTUAL: result.nodeId 사용
                originalNodeId = result.nodeId();
            }

            // 1. 상태 확인
            if (!"SUCCESS".equals(result.status())) {
                log.error("AI analysis failed: workspaceId={}, nodeId={}, status={}, type={}",
                        result.workspaceId(), originalNodeId, result.status(), analysisType);
                updateNodeAnalysisStatus(result.workspaceId(), originalNodeId,
                        MindmapNode.AnalysisStatus.FAILED);
                return;
            }

            // 2. INITIAL인 경우 원본 노드의 memo에 aiSummary 업데이트 및 워크스페이스 title 업데이트
            if (isInitial) {
                if (result.aiSummary() != null) {
                    updateNodeMemo(result.workspaceId(), originalNodeId, result.aiSummary());
                    log.info("Updated original node memo with AI summary: workspaceId={}, nodeId={}",
                            result.workspaceId(), originalNodeId);
                }

                // 워크스페이스 title 업데이트
                if (result.title() != null && !result.title().isBlank()) {
                    // TODO: userId를 AiAnalysisResult에 포함시켜야 함
                    Long userId = 1L; // 임시 하드코딩
                    workspaceServiceClient.updateWorkspaceTitle(userId, result.workspaceId(), result.title());
                    log.info("Updated workspace title: workspaceId={}, title={}",
                            result.workspaceId(), result.title());
                }
            }

            // 3. AI가 생성한 노드들 처리
            if (result.nodes() != null && !result.nodes().isEmpty()) {
                List<MindmapNode> createdNodes = nodeService.createNodesFromAiResult(
                        result.workspaceId(),
                        result.nodes(),
                        originalNodeId,
                        analysisType
                );

                log.info("Created {} nodes from AI result: workspaceId={}, type={}",
                        createdNodes.size(), result.workspaceId(), analysisType);

                // 4. 생성된 각 노드를 WebSocket으로 전파
                for (MindmapNode node : createdNodes) {
                    Map<String, Object> nodeData = new HashMap<>();
                    nodeData.put("nodeId", node.getNodeId());
                    nodeData.put("parentId", node.getParentId());
                    nodeData.put("keyword", node.getKeyword());
                    nodeData.put("memo", node.getMemo());
                    nodeData.put("type", node.getType());
                    nodeData.put("createdAt", node.getCreatedAt() != null ? node.getCreatedAt().toString() : null);

                    nodeUpdateProducer.sendNodeUpdate(
                            result.workspaceId(),
                            node.getNodeId(),
                            nodeData
                    );

                    log.debug("Published new node to y.js server: workspaceId={}, nodeId={}, keyword={}",
                            result.workspaceId(), node.getNodeId(), node.getKeyword());
                }
            }

            // 5. 원본 노드의 분석 상태를 DONE으로 변경
            updateNodeAnalysisStatus(result.workspaceId(), originalNodeId,
                    MindmapNode.AnalysisStatus.DONE);

            log.info("Successfully processed AI analysis result: workspaceId={}, nodeId={}, type={}",
                    result.workspaceId(), originalNodeId, analysisType);

        } catch (Exception e) {
            log.error("Failed to process AI analysis result", e);
        }
    }

    /**
     * 노드의 memo를 AI Summary로 업데이트합니다 (INITIAL 분석 전용)
     */
    private void updateNodeMemo(Long workspaceId, Long nodeId, String aiSummary) {
        try {
            MindmapNode node = nodeRepository.findByWorkspaceIdAndNodeId(workspaceId, nodeId)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Node not found: workspaceId=" + workspaceId + ", nodeId=" + nodeId));

            node.setMemo(aiSummary);
            node.setUpdatedAt(LocalDateTime.now());
            nodeRepository.save(node);

            log.debug("Updated node memo with AI summary: workspaceId={}, nodeId={}",
                    workspaceId, nodeId);

            // WebSocket으로 memo 변경 전파
            Map<String, Object> updates = new HashMap<>();
            updates.put("memo", aiSummary);
            updates.put("updatedAt", node.getUpdatedAt().toString());

            nodeUpdateProducer.sendNodeUpdate(workspaceId, nodeId, updates);

        } catch (Exception e) {
            log.error("Failed to update node memo: workspaceId={}, nodeId={}",
                    workspaceId, nodeId, e);
        }
    }

    /**
     * 노드의 분석 상태를 업데이트합니다.
     */
    private void updateNodeAnalysisStatus(Long workspaceId, Long nodeId,
                                          MindmapNode.AnalysisStatus status) {
        try {
            MindmapNode node = nodeRepository.findByWorkspaceIdAndNodeId(workspaceId, nodeId)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Node not found: workspaceId=" + workspaceId + ", nodeId=" + nodeId));

            node.setAnalysisStatus(status);
            node.setUpdatedAt(LocalDateTime.now());
            nodeRepository.save(node);

            log.debug("Updated node analysis status: workspaceId={}, nodeId={}, status={}",
                    workspaceId, nodeId, status);

            // WebSocket으로 상태 변경 전파
            Map<String, Object> updates = new HashMap<>();
            updates.put("analysisStatus", status.name());
            updates.put("updatedAt", node.getUpdatedAt().toString());

            nodeUpdateProducer.sendNodeUpdate(workspaceId, nodeId, updates);

        } catch (Exception e) {
            log.error("Failed to update node analysis status: workspaceId={}, nodeId={}, status={}",
                    workspaceId, nodeId, status, e);
        }
    }
}
