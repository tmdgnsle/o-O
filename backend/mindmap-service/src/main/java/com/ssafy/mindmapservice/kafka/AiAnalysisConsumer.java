package com.ssafy.mindmapservice.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.mindmapservice.domain.MindmapNode;
import com.ssafy.mindmapservice.dto.AiAnalysisResult;
import com.ssafy.mindmapservice.repository.NodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class AiAnalysisConsumer {

    private final NodeRepository nodeRepository;
    private final NodeUpdateProducer nodeUpdateProducer;
    private final ObjectMapper objectMapper;

    /**
     * AI 서버로부터 분석 결과를 받아서 처리합니다.
     * 1. MongoDB의 노드 정보 업데이트
     * 2. mindmap.node.update 토픽으로 변경사항 발행 (y.js 서버 → 웹소켓 클라이언트)
     */
    @KafkaListener(topics = "${kafka.topics.ai-analysis-result}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeAnalysisResult(String message) {
        try {
            log.debug("Received AI analysis result: {}", message);

            AiAnalysisResult result = objectMapper.readValue(message, AiAnalysisResult.class);

            // 1. MongoDB에서 노드 조회
            MindmapNode node = nodeRepository.findByWorkspaceIdAndNodeId(
                    result.workspaceId(),
                    result.nodeId()
            ).orElseThrow(() -> new IllegalArgumentException(
                    "Node not found: workspaceId=" + result.workspaceId() + ", nodeId=" + result.nodeId()
            ));

            // 2. AI 분석 결과로 노드 업데이트
            MindmapNode.AnalysisStatus analysisStatus = "SUCCESS".equals(result.status())
                    ? MindmapNode.AnalysisStatus.DONE
                    : MindmapNode.AnalysisStatus.FAILED;

            node.setAiSummary(result.aiSummary());
            node.setAnalysisStatus(analysisStatus);
            node.setUpdatedAt(LocalDateTime.now());

            nodeRepository.save(node);

            log.info("Updated node with AI analysis result: workspaceId={}, nodeId={}, status={}",
                    result.workspaceId(), result.nodeId(), analysisStatus);

            // 3. y.js 서버로 실시간 업데이트 발행 (웹소켓 클라이언트들에게 전달)
            Map<String, Object> updates = new HashMap<>();
            updates.put("aiSummary", result.aiSummary());
            updates.put("analysisStatus", analysisStatus.name());
            updates.put("updatedAt", node.getUpdatedAt().toString());

            nodeUpdateProducer.sendNodeUpdate(result.workspaceId(), result.nodeId(), updates);

            log.info("Published node update to y.js server: workspaceId={}, nodeId={}",
                    result.workspaceId(), result.nodeId());

        } catch (Exception e) {
            log.error("Failed to process AI analysis result", e);
        }
    }
}
