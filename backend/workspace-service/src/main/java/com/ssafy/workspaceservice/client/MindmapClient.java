package com.ssafy.workspaceservice.client;

import com.ssafy.workspaceservice.dto.response.MindmapNodeDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Map;

@FeignClient(name = "mindmap-service", url = "${mindmap.service.url:http://mindmap-svc:8082}")
public interface MindmapClient {

    /**
     * 여러 워크스페이스의 노드를 일괄 조회
     * @param workspaceIds 조회할 워크스페이스 ID 목록
     * @return workspaceId별로 그룹핑된 노드 목록
     */
    @PostMapping("/mindmap/nodes/simple/batch")
    Map<Long, List<MindmapNodeDto>> getNodesByWorkspaceIds(@RequestBody List<Long> workspaceIds);
}
