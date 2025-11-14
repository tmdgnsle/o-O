package com.ssafy.mindmapservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@FeignClient(name = "workspace-service", url = "${workspace.service.url:http://localhost:8083}")
public interface WorkspaceServiceClient {

    /**
     * 워크스페이스 생성
     * @param userId 사용자 ID (X-USER-ID 헤더로 전송)
     * @return 워크스페이스 응답 (workspaceId 포함)
     */
    @PostMapping("/workspace")
    Map<String, Object> createWorkspace(@RequestHeader("X-USER-ID") Long userId);

    /**
     * 워크스페이스 가시성 조회 (PUBLIC/PRIVATE)
     */
    @GetMapping("/workspace/{workspaceId}/visibility")
    Map<String, Object> getVisibility(@PathVariable("workspaceId") Long workspaceId);

    /**
     * 모든 Public 워크스페이스 ID 목록 조회
     */
    @GetMapping("/workspace/workspace-ids")
    Map<String, List<Integer>> getPublicWorkspaceIds();

    /**
     * 워크스페이스 제목 업데이트
     */
    @PatchMapping("/workspace/{workspaceId}")
    void updateWorkspaceTitle(
            @RequestHeader("X-USER-ID") Long userId,
            @PathVariable("workspaceId") Long workspaceId,
            @RequestBody Map<String, Object> request
    );
}
