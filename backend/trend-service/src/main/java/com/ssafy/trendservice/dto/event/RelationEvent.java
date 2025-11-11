package com.ssafy.trendservice.dto.event;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Kafka로부터 수신하는 Relation 이벤트 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RelationEvent {

    @JsonProperty("eventType")
    private EventType eventType;

    @JsonProperty("userId")
    private String userId;

    @JsonProperty("parentKeyword")
    private String parentKeyword;

    @JsonProperty("childKeyword")
    private String childKeyword;

    @JsonProperty("timestamp")
    private LocalDateTime timestamp;

    @JsonProperty("metadata")
    private String metadata;
}