package com.ssafy.mindmapservice.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.mindmapservice.domain.MindmapNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.BulkOperations;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class NodeEventConsumer {

    private final MongoTemplate mongoTemplate;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "${kafka.topics.node-events}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeNodeEvents(String message) {
        try {
            log.debug("Received Kafka message: {}", message);

            List<Map<String, Object>> events = objectMapper.readValue(message, List.class);
            log.info("Processing {} node events", events.size());

            BulkOperations bulkOps = mongoTemplate.bulkOps(BulkOperations.BulkMode.UNORDERED, MindmapNode.class);

            for (Map<String, Object> event : events) {
                String operation = (String) event.get("operation");

                // nodeId 변환 (Integer, Long, String 모두 지원)
                Object nodeIdObj = event.get("nodeId");
                Long nodeId = nodeIdObj instanceof Integer
                    ? ((Integer) nodeIdObj).longValue()
                    : nodeIdObj instanceof String
                        ? Long.parseLong((String) nodeIdObj)
                        : (Long) nodeIdObj;

                Object workspaceIdObj = event.get("workspaceId");
                Long workspaceId = workspaceIdObj instanceof Integer
                    ? ((Integer) workspaceIdObj).longValue()
                    : (Long) workspaceIdObj;

                switch (operation) {
                    case "ADD":
                        // parentId 변환
                        Object parentIdObj = event.get("parentId");
                        Long parentId = parentIdObj == null ? null :
                                parentIdObj instanceof Integer
                                    ? ((Integer) parentIdObj).longValue()
                                    : parentIdObj instanceof String
                                        ? Long.parseLong((String) parentIdObj)
                                        : (Long) parentIdObj;

                        MindmapNode newNode = MindmapNode.builder()
                                .nodeId(nodeId)
                                .workspaceId(workspaceId)
                                .parentId(parentId)
                                .type((String) event.get("type"))
                                .keyword((String) event.get("keyword"))
                                .memo((String) event.get("memo"))
                                .x(getDouble(event.get("x")))
                                .y(getDouble(event.get("y")))
                                .color((String) event.get("color"))
                                .analysisStatus(MindmapNode.AnalysisStatus.NONE)
                                .createdAt(LocalDateTime.now())
                                .updatedAt(LocalDateTime.now())
                                .build();
                        bulkOps.insert(newNode);
                        break;

                    case "UPDATE":
                        Query query = new Query(Criteria.where("nodeId").is(nodeId).and("workspaceId").is(workspaceId));
                        Update update = new Update();

                        if (event.containsKey("keyword")) {
                            update.set("keyword", event.get("keyword"));
                        }
                        if (event.containsKey("memo")) {
                            update.set("memo", event.get("memo"));
                        }
                        if (event.containsKey("x")) {
                            update.set("x", getDouble(event.get("x")));
                        }
                        if (event.containsKey("y")) {
                            update.set("y", getDouble(event.get("y")));
                        }
                        if (event.containsKey("color")) {
                            update.set("color", event.get("color"));
                        }
                        if (event.containsKey("parentId")) {
                            Object updateParentIdObj = event.get("parentId");
                            Long updateParentId = updateParentIdObj == null ? null :
                                    updateParentIdObj instanceof Integer
                                        ? ((Integer) updateParentIdObj).longValue()
                                        : updateParentIdObj instanceof String
                                            ? Long.parseLong((String) updateParentIdObj)
                                            : (Long) updateParentIdObj;
                            update.set("parentId", updateParentId);
                        }
                        if (event.containsKey("contentUrl")) {
                            update.set("contentUrl", event.get("contentUrl"));
                        }

                        update.set("updatedAt", LocalDateTime.now());
                        bulkOps.updateOne(query, update);
                        break;

                    case "DELETE":
                        Query deleteQuery = new Query(Criteria.where("nodeId").is(nodeId).and("workspaceId").is(workspaceId));
                        bulkOps.remove(deleteQuery);
                        break;

                    default:
                        log.warn("Unknown operation: {}", operation);
                }
            }

            bulkOps.execute();
            log.info("Successfully processed {} node events", events.size());

        } catch (Exception e) {
            log.error("Failed to process Kafka message", e);
        }
    }

    private Double getDouble(Object value) {
        if (value == null) return null;
        if (value instanceof Double) return (Double) value;
        if (value instanceof Integer) return ((Integer) value).doubleValue();
        if (value instanceof String) return Double.parseDouble((String) value);
        return null;
    }
}
