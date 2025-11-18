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
                Long nodeId = getLong(nodeIdObj);

                Object workspaceIdObj = event.get("workspaceId");
                Long workspaceId = getLong(workspaceIdObj);

                switch (operation) {
                    case "ADD":
                        // parentId 변환
                        Object parentIdObj = event.get("parentId");
                        Long parentId = parentIdObj == null ? null : getLong(parentIdObj);

                        LocalDateTime now = LocalDateTime.now();

                        // (workspaceId, nodeId) 기준으로 upsert
                        Query addQuery = new Query(
                                Criteria.where("workspaceId").is(workspaceId)
                                        .and("nodeId").is(nodeId)
                        );

                        Update addUpdate = new Update()
                                // 이미 있는 노드여도 최신 값으로 덮어쓰기
                                .set("parentId", parentId)
                                .set("type", (String) event.get("type"))
                                .set("keyword", (String) event.get("keyword"))
                                .set("memo", (String) event.get("memo"))
                                .set("x", getDouble(event.get("x")))
                                .set("y", getDouble(event.get("y")))
                                .set("color", (String) event.get("color"))
                                .set("analysisStatus", MindmapNode.AnalysisStatus.NONE)
                                .set("updatedAt", now)
                                // ⬇처음 생길 때만 넣고 싶은 값은 setOnInsert
                                .setOnInsert("workspaceId", workspaceId)
                                .setOnInsert("nodeId", nodeId)
                                .setOnInsert("createdAt", now);

                        //  bulkOps.insert(newNode);
                        //  upsert로 변경
                        bulkOps.upsert(addQuery, addUpdate);
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
                            Long updateParentId = updateParentIdObj == null ? null : getLong(updateParentIdObj);
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

    private Long getLong(Object value) {
        if (value == null) return null;

        if (value instanceof Long) return (Long) value;
        if (value instanceof Integer) return ((Integer) value).longValue();
        if (value instanceof String) return Long.parseLong((String) value);

        throw new IllegalArgumentException(
                "Cannot convert value to Long: " + value + " (" + value.getClass() + ")"
        );
    }

}
