package com.ssafy.mindmapservice.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class NodeUpdateProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Value("${kafka.topics.node-update}")
    private String nodeUpdateTopic;

    public void sendNodeUpdate(Long workspaceId) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("workspaceId", workspaceId);
            message.put("message", "노드 분석 후 업데이트를 완료했습니다.");

            String jsonMessage = objectMapper.writeValueAsString(message);

            kafkaTemplate.send(nodeUpdateTopic, workspaceId.toString(), jsonMessage);
            log.info("Sent node update to Kafka: workspaceId={}, message={}", workspaceId, message.get("message"));

        } catch (Exception e) {
            log.error("Failed to send node update to Kafka", e);
        }
    }
}
