package com.ssafy.mindmapservice.controller;

import com.ssafy.mindmapservice.domain.MindmapNode;
import com.ssafy.mindmapservice.dto.AiAnalysisRequest;
import com.ssafy.mindmapservice.dto.NodeColorUpdateRequest;
import com.ssafy.mindmapservice.dto.NodePositionUpdateRequest;
import com.ssafy.mindmapservice.dto.WorkspaceCloneRequest;
import com.ssafy.mindmapservice.service.NodeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/mindmap")
@RequiredArgsConstructor
public class NodeController {

    private final NodeService nodeService;

    @GetMapping("/{workspaceId}/nodes")
    public ResponseEntity<List<MindmapNode>> getNodes(@PathVariable Long workspaceId) {
        log.info("GET /mindmap/{}/nodes", workspaceId);
        List<MindmapNode> nodes = nodeService.getNodesByWorkspace(workspaceId);
        return ResponseEntity.ok(nodes);
    }

    @GetMapping("/{workspaceId}/node/{nodeId}")
    public ResponseEntity<MindmapNode> getNode(
            @PathVariable Long workspaceId,
            @PathVariable Long nodeId) {
        log.info("GET /mindmap/{}/node/{}", workspaceId, nodeId);
        MindmapNode node = nodeService.getNode(workspaceId, nodeId);
        return ResponseEntity.ok(node);
    }

    @PostMapping("/{workspaceId}/node")
    public ResponseEntity<MindmapNode> createNode(
            @PathVariable Long workspaceId,
            @RequestBody MindmapNode node) {
        log.info("POST /mindmap/{}/node", workspaceId);
        node.setWorkspaceId(workspaceId);
        MindmapNode created = nodeService.createNode(node);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{workspaceId}/node/{nodeId}")
    public ResponseEntity<MindmapNode> updateNode(
            @PathVariable Long workspaceId,
            @PathVariable Long nodeId,
            @RequestBody MindmapNode updates) {
        log.info("PATCH /mindmap/{}/node/{}", workspaceId, nodeId);
        MindmapNode updated = nodeService.updateNode(workspaceId, nodeId, updates);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{workspaceId}/node/{nodeId}")
    public ResponseEntity<Void> deleteNode(
            @PathVariable Long workspaceId,
            @PathVariable Long nodeId) {
        log.info("DELETE /mindmap/{}/node/{}", workspaceId, nodeId);
        nodeService.deleteNode(workspaceId, nodeId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{workspaceId}/nodes")
    public ResponseEntity<Void> deleteAllNodes(@PathVariable Long workspaceId) {
        log.info("DELETE /mindmap/{}/nodes", workspaceId);
        nodeService.deleteAllNodes(workspaceId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{workspaceId}/nodes/count")
    public ResponseEntity<Long> countNodes(@PathVariable Long workspaceId) {
        log.info("GET /mindmap/{}/nodes/count", workspaceId);
        long count = nodeService.countNodes(workspaceId);
        return ResponseEntity.ok(count);
    }

    @PatchMapping("/{workspaceId}/node/{nodeId}/position")
    public ResponseEntity<MindmapNode> updateNodePosition(
            @PathVariable Long workspaceId,
            @PathVariable Long nodeId,
            @RequestBody NodePositionUpdateRequest request) {
        log.info("PATCH /mindmap/{}/node/{}/position", workspaceId, nodeId);
        MindmapNode updated = nodeService.updateNodePosition(workspaceId, nodeId, request.x(), request.y());
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{workspaceId}/node/{nodeId}/color")
    public ResponseEntity<MindmapNode> updateNodeColor(
            @PathVariable Long workspaceId,
            @PathVariable Long nodeId,
            @RequestBody NodeColorUpdateRequest request) {
        log.info("PATCH /mindmap/{}/node/{}/color", workspaceId, nodeId);
        MindmapNode updated = nodeService.updateNodeColor(workspaceId, nodeId, request.color());
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{workspaceId}/clone")
    public ResponseEntity<List<MindmapNode>> cloneWorkspace(
            @PathVariable Long workspaceId,
            @RequestBody WorkspaceCloneRequest request) {
        log.info("POST /mindmap/{}/clone with name={}", workspaceId, request.workspaceName());
        List<MindmapNode> clonedNodes = nodeService.cloneWorkspace(
                workspaceId,
                request.workspaceName(),
                request.workspaceDescription()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(clonedNodes);
    }

    /**
     * AI 분석을 요청합니다.
     * 클라이언트가 이미지/영상과 프롬프트를 전송하면,
     * Kafka를 통해 AI 서버로 분석 요청을 전달합니다.
     */
    @PostMapping("/{workspaceId}/node/{nodeId}/analyze")
    public ResponseEntity<Void> requestAiAnalysis(
            @PathVariable Long workspaceId,
            @PathVariable Long nodeId,
            @RequestBody AiAnalysisRequest request) {
        log.info("POST /mindmap/{}/node/{}/analyze - contentType={}",
                workspaceId, nodeId, request.contentType());

        nodeService.requestAiAnalysis(
                workspaceId,
                nodeId,
                request.contentUrl(),
                request.contentType(),
                request.prompt(),
                request.userId()
        );

        return ResponseEntity.accepted().build();
    }
}
