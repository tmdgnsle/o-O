package com.ssafy.workspaceservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "mindmap-service", url = "${mindmap.service.url:http://mindmap-svc:8082}")
public interface MindmapClient {

    /**
     * 여러 워크스페이스의 모든 키워드를 일괄 조회
     * @param workspaceIds 조회할 워크스페이스 ID 목록
     * @return 모든 노드의 키워드 목록 (평면 리스트)
     */
    @PostMapping("/mindmap/nodes/keywords/batch")
    List<String> getKeywordsByWorkspaceIds(@RequestBody List<Long> workspaceIds);
}
