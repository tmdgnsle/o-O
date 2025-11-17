package com.ssafy.mindmapservice.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.mindmapservice.dto.kafka.AiContextualSuggestion;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AiSuggestionProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Value("${kafka.topics.ai-suggestion}")
    private String aiSuggestionTopic;

    /**
     * CONTEXTUAL 분석 결과를 프론트용 추천 이벤트로 전송합니다.
     * - MongoDB에는 새 노드를 만들지 않고
     * - WebSocket 서버가 이 토픽을 구독해서 클라이언트에 뿌리도록 사용
     */
    public void sendContextualSuggestion(AiContextualSuggestion suggestion) {
        try {
            String json = objectMapper.writeValueAsString(suggestion);

            // workspaceId 기준 파티셔닝
            kafkaTemplate.send(aiSuggestionTopic, suggestion.workspaceId().toString(), json);

            log.info("📤 Sent AI contextual suggestion: workspaceId={}, targetNodeId={}, count={}",
                    suggestion.workspaceId(), suggestion.targetNodeId(),
                    suggestion.suggestions() != null ? suggestion.suggestions().size() : 0);
        } catch (Exception e) {
            log.error("❌ Failed to send AI contextual suggestion", e);
            throw new RuntimeException("AI 추천 전송 실패", e);
        }
    }
}
