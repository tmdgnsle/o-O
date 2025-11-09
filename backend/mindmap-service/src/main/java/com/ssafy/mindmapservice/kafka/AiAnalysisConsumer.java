package com.ssafy.mindmapservice.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.mindmapservice.domain.MindmapNode;
import com.ssafy.mindmapservice.dto.AiAnalysisResult;
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

    /**
     * AI 서버로부터 분석 결과를 받아서 처리합니다.
     * 1. AI가 생성한 노드들을 MongoDB에 저장
     * 2. 원본 노드의 분석 상태를 DONE으로 변경
     * 3. mindmap.node.update 토픽으로 변경사항 발행 (y.js 서버 → 웹소켓 클라이언트)
     */
    @KafkaListener(topics = "${kafka.topics.ai-analysis-result}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeAnalysisResult(String message) {
        try {
            log.debug("Received AI analysis result: {}", message);

            AiAnalysisResult result = objectMapper.readValue(message, AiAnalysisResult.class);

            // 1. 상태 확인
            if (!"SUCCESS".equals(result.status())) {
                log.error("AI analysis failed: workspaceId={}, nodeId={}, status={}",
                        result.workspaceId(), result.nodeId(), result.status());
                updateNodeAnalysisStatus(result.workspaceId(), result.nodeId(),
                        MindmapNode.AnalysisStatus.FAILED);
                return;
            }

            // 2. AI가 생성한 노드들 처리
            if (result.nodes() != null && !result.nodes().isEmpty()) {
                List<MindmapNode> createdNodes = nodeService.createNodesFromAiResult(
                        result.workspaceId(),
                        result.nodes(),
                        result.nodeId(),
                        result.analysisType()
                );

                log.info("Created {} nodes from AI result: workspaceId={}, type={}",
                        createdNodes.size(), result.workspaceId(), result.analysisType());

                // 3. 생성된 각 노드를 WebSocket으로 전파
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

            // 4. 원본 노드의 분석 상태를 DONE으로 변경
            updateNodeAnalysisStatus(result.workspaceId(), result.nodeId(),
                    MindmapNode.AnalysisStatus.DONE);

            log.info("Successfully processed AI analysis result: workspaceId={}, nodeId={}",
                    result.workspaceId(), result.nodeId());

        } catch (Exception e) {
            log.error("Failed to process AI analysis result", e);
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
