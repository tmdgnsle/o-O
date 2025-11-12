package com.ssafy.mindmapservice.service;

import com.ssafy.mindmapservice.client.WorkspaceServiceClient; // 네가 준 것 재사용(REST로 public 조회)
import com.ssafy.mindmapservice.dto.TrendEventType;
import com.ssafy.mindmapservice.dto.TrendRelationEvent;
import com.ssafy.mindmapservice.kafka.TrendEventBuffer;
import lombok.RequiredArgsConstructor;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class TrendEventPublisher {

    private final WorkspaceServiceClient workspaceClient;
    private final TrendEventBuffer buffer;

    public void publishRelationAdd(long workspaceId, String parent, String child) {
        if (!isPublic(workspaceId)) return;
        long now = System.currentTimeMillis();
        String idemp = TrendEventBuffer.makeIdempotency(workspaceId, parent, child, TrendEventType.RELATION_ADD, now);

        buffer.offer(new TrendRelationEvent(
                TrendEventType.RELATION_ADD, now, workspaceId, parent, child, idemp
        ));
    }

    public void publishRelationView(long workspaceId, String parent, String child) {
        if (!isPublic(workspaceId)) return;
        long now = System.currentTimeMillis();
        String idemp = TrendEventBuffer.makeIdempotency(workspaceId, parent, child, TrendEventType.RELATION_VIEW, now);

        buffer.offer(new TrendRelationEvent(
                TrendEventType.RELATION_VIEW, now, workspaceId, parent, child, idemp
        ));
    }

    private boolean isPublic(long workspaceId) {
        try {
            // workspace-service API 결과가 "PUBLIC"/"PRIVATE"라면:
            String vis = workspaceClient.getVisibility(workspaceId);
            return "PUBLIC".equalsIgnoreCase(vis);
        } catch (Exception e) {
            // 안전하게: 실패 시 발행하지 않음
            log.error(e.getMessage());
            return false;
        }
    }
}